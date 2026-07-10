import { POST } from "@/app/api/media/video-url/route";
it("rejects video paths that are absent from static content", async () => { const response = await POST(new Request("http://localhost/api/media/video-url", {method:"POST",body:JSON.stringify({path:"cases/unknown/video.mp4"})})); expect(response.status).toBe(400); expect(await response.json()).toEqual({error:"Unknown video"}); });
