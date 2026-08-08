export function AigcFooter() {
  return (
    <footer className="aigc-footer">
      <div className="aigc-footer__identity">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aigc/brand/mark.webp" alt="" width={28} height={28} />
        <span>万象元生</span>
      </div>
      <p>
        万象元生 © 2026 版权所有
        <br />
        深圳市方直智胜科技有限公司｜方直科技（300235）全资子公司
      </p>
      <nav aria-label="页脚导航">
        <a href="/privacy">隐私政策</a>
        <a href="/terms">服务条款</a>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
          粤ICP备XXXXXXXX号
        </a>
      </nav>
    </footer>
  );
}
