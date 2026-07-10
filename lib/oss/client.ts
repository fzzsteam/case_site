import "server-only";
import OSS from "ali-oss";
import { getOssConfig } from "./config";
let client: OSS | undefined;
export function getOssClient() { client ??= new OSS(getOssConfig()); return client; }
