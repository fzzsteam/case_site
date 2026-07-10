import { ImageResponse } from "next/og";
export const alt="万象元生文旅 AIGC 影像创作";export const size={width:1200,height:630};export const contentType="image/png";
export default function Image(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"80px",background:"#eee8da",color:"#163f39"}}><div style={{fontSize:24,letterSpacing:8,color:"#b89551"}}>WANXIANG AIGC</div><div style={{fontSize:72,marginTop:30}}>用 AIGC 重新定义文旅表达</div><div style={{fontSize:28,marginTop:28}}>创意 · 科技 · 文化 · 共生</div></div>,size);}
