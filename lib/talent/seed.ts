import "server-only";
import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { talentProfiles, talentWorks } from "@/lib/db/schema";
import { DEMO_TALENTS } from "./demo-data";

function serializeList(value: string[] | undefined): string | null {
  return value?.length ? JSON.stringify(value) : null;
}

/**
 * 将人才集市初始数据幂等迁移到数据库。
 * 作品媒体只保存 OSS 对象路径，重复启动不会重复插入资源或资料。
 */
export async function migrateTalentData(): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    // 这三个旧样例属于欧阳的非网站作品，确保历史数据升级后也符合当前资料口径。
    await tx.delete(talentWorks).where(inArray(talentWorks.id, ["ouyang-heyuan", "ouyang-orange", "ouyang-visual"]));

    for (const [talentIndex, talent] of DEMO_TALENTS.entries()) {
      await tx.insert(talentProfiles).values({
        id: talent.id,
        name: talent.name,
        role: talent.role,
        intro: talent.intro,
        bio: talent.bio,
        avatarPath: talent.avatarPath ?? null,
        location: talent.location ?? null,
        skills: JSON.stringify(talent.skills),
        sortOrder: talentIndex,
      }).onDuplicateKeyUpdate({
        set: {
          name: talent.name,
          role: talent.role,
          intro: talent.intro,
          bio: talent.bio,
          avatarPath: talent.avatarPath ?? null,
          location: talent.location ?? null,
          skills: JSON.stringify(talent.skills),
          sortOrder: talentIndex,
        },
      });

      for (const [workIndex, work] of talent.works.entries()) {
        const mediaPaths = work.mediaPaths?.length ? work.mediaPaths : work.mediaPath ? [work.mediaPath] : undefined;
        await tx.insert(talentWorks).values({
          id: work.id,
          talentId: talent.id,
          slug: work.slug,
          title: work.title,
          type: work.type,
          source: work.source,
          summary: work.summary,
          coverPath: work.coverPath ?? "",
          mediaPath: mediaPaths?.[0] ?? null,
          mediaPaths: serializeList(mediaPaths),
          galleryPaths: serializeList(work.galleryPaths),
          siteSlug: work.siteSlug ?? null,
          siteUrl: work.siteUrl ?? null,
          sortOrder: workIndex,
        }).onDuplicateKeyUpdate({
          set: {
            talentId: talent.id,
            slug: work.slug,
            title: work.title,
            type: work.type,
            source: work.source,
            summary: work.summary,
            coverPath: work.coverPath ?? "",
            mediaPath: mediaPaths?.[0] ?? null,
            mediaPaths: serializeList(mediaPaths),
            galleryPaths: serializeList(work.galleryPaths),
            siteSlug: work.siteSlug ?? null,
            siteUrl: work.siteUrl ?? null,
            sortOrder: workIndex,
          },
        });
      }
    }
  });
}
