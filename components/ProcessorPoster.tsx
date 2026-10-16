export default function ProcessorPoster({hidden=false}:{hidden?:boolean}){
  return <div className="processor-poster processor-world" hidden={hidden} aria-hidden="true">
    <picture>
      <source media="(max-width: 600px)" srcSet="/models/motherboard/poster-mobile.webp"/>
      <source media="(max-width: 1023px)" srcSet="/models/motherboard/poster-tablet.webp"/>
      <img src="/models/motherboard/poster-desktop.webp" alt="" width="1425" height="1107" decoding="async" fetchPriority="high"/>
    </picture>
  </div>;
}
