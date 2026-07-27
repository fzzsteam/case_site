import { Film, Landmark, Mountain, Radio } from "lucide-react";

const serviceItems = [
  { title: "城市文旅 AI 宣传片", icon: Mountain }, { title: "文旅短视频 / 微短剧代运营", icon: Radio },
  { title: "博物馆文物数字化", icon: Landmark }, { title: "乡村文旅 / 非遗数字化", icon: Film },
];

export function ServiceHighlights() {
  return <div className="about-services">
    <h3>服务内容</h3>
    <div className="about-services-grid">
      {serviceItems.map(({ title, icon: Icon }) => <div className="about-service-item" key={title}><Icon /><span>{title}</span></div>)}
    </div>
  </div>;
}
