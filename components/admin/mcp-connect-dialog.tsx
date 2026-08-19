"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Guide = {
  key: string;
  label: string;
  /** 这一栏适用于哪些客户端，帮用户对号入座。 */
  audience: string;
  hint?: string;
  blocks: Array<{ caption?: string; code: string }>;
};

function buildGuides(endpoint: string, token: string): Guide[] {
  const auth = `Bearer ${token}`;
  const jsonServer = `{
  "type": "http",
  "url": "${endpoint}",
  "headers": {
    "Authorization": "${auth}"
  }
}`;

  return [
    {
      key: "claude-code",
      label: "Claude Code",
      audience: "命令行版 Claude Code",
      hint: "执行后在 Claude Code 里输入 /mcp，看到 wechat 且工具数为 52 就算接上了。",
      blocks: [{ code: `claude mcp add --transport http wechat ${endpoint} \\\n  --header "Authorization: ${auth}"` }],
    },
    {
      key: "json",
      label: "通用 JSON",
      audience: "Claude Desktop、Cursor、Windsurf、Cherry Studio、Trae 等绝大多数客户端",
      hint: '各家对传输类型的字段值不统一。如果客户端不识别，把 "type" 依次换成 "streamableHttp"、"streamable-http" 或 "sse" 再试；少数客户端用 "transport" 而不是 "type"。',
      blocks: [
        {
          caption: "写进客户端的 MCP 配置文件（通常是 mcp.json 或设置里的「编辑配置」）",
          code: `{
  "mcpServers": {
    "wechat": ${jsonServer.split("\n").join("\n    ")}
  }
}`,
        },
      ],
    },
    {
      key: "vscode",
      label: "VS Code",
      audience: "VS Code + GitHub Copilot（.vscode/mcp.json）",
      hint: "VS Code 用的顶层键是 servers，不是 mcpServers，写错了不会报错、只是连不上。",
      blocks: [
        {
          caption: ".vscode/mcp.json",
          code: `{
  "servers": {
    "wechat": ${jsonServer.split("\n").join("\n    ")}
  }
}`,
        },
      ],
    },
    {
      key: "stdio",
      label: "仅支持 stdio",
      audience: "只能填「命令 + 参数」、没有 URL 输入框的老客户端",
      hint: "用 mcp-remote 在本地架一座桥，把 stdio 转成远程 HTTP。需要本地装了 Node.js 18+。",
      blocks: [
        {
          code: `{
  "mcpServers": {
    "wechat": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${endpoint}",
        "--header",
        "Authorization: ${auth}"
      ]
    }
  }
}`,
        },
      ],
    },
    {
      key: "manual",
      label: "图形界面手填",
      audience: "WorkBuddy 等在界面上一项项填写的客户端",
      hint: "本服务不需要 OAuth 授权、不需要环境变量、也不提供 SSE 长连接；如果客户端只有 SSE 选项而没有 Streamable HTTP，请改用左边的「仅支持 stdio」方案。",
      blocks: [
        {
          caption: "按客户端界面上的字段逐项填入",
          code: `服务器名称：wechat
传输类型：Streamable HTTP（有的写作 streamableHttp / HTTP / 可流式传输的 HTTP）
服务器地址：${endpoint}
请求头名称：Authorization
请求头的值：${auth}`,
        },
      ],
    },
  ];
}

function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时用户仍可手动选中复制 */
    }
  }

  return (
    <div className="mt-3">
      {caption && <p className="mb-1.5 text-xs text-muted-foreground">{caption}</p>}
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/60 p-3 pr-11 font-mono text-xs leading-relaxed text-foreground">{code}</pre>
        <Button variant="ghost" size="icon-sm" aria-label="复制代码" className="absolute right-1.5 top-1.5 bg-card/80" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
    </div>
  );
}

export function McpConnectDialog({ open, endpoint, token, tokenName, onClose }: {
  open: boolean;
  endpoint: string;
  token: string;
  tokenName: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState("claude-code");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const guides = buildGuides(endpoint, token);
  const current = guides.find((guide) => guide.key === active) ?? guides[0];

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClose={onClose}
      className="m-auto w-[92vw] max-w-2xl rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">接入指南</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            使用 Token「{tokenName}」。下面的配置已经把地址和凭证填好，选你用的客户端复制即可。
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="关闭" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      <div className="px-6 pt-4">
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {guides.map((guide) => (
            <button
              key={guide.key}
              type="button"
              role="tab"
              aria-selected={guide.key === active}
              onClick={() => setActive(guide.key)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                guide.key === active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {guide.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[55vh] overflow-y-auto px-6 pb-6 pt-3">
        <p className="text-xs text-muted-foreground">适用于：{current.audience}</p>
        {current.blocks.map((block, index) => (
          <CodeBlock key={index} code={block.code} caption={block.caption} />
        ))}
        {current.hint && (
          <p className="mt-3 rounded-lg border border-border bg-accent/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">{current.hint}</p>
        )}
      </div>
    </dialog>
  );
}
