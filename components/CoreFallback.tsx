export default function CoreFallback() {
  return (
    <div className="core-fallback" aria-hidden="true">
      <svg viewBox="0 0 700 700" fill="none">
        <defs>
          <linearGradient
            id="plate"
            x1="200"
            y1="200"
            x2="500"
            y2="500"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4e7563" />
            <stop offset="1" stopColor="#09271f" />
          </linearGradient>
        </defs>
        <path d="M192 270V492M508 270V492M350 166V392" stroke="#b4c0af" strokeWidth="5" />
        {[4, 3, 2, 1, 0].map((i) => (
          <g key={i} transform={`translate(0 ${i * 39 - 70})`}>
            <path
              d="M350 215L525 310V338L350 435L175 338V310Z"
              fill="url(#plate)"
              stroke="#94ab94"
              strokeWidth="1.2"
            />
            <path d="M175 310L350 407L525 310M350 407V435" stroke="#c8a968" strokeOpacity=".7" />
            <path d="M350 252L455 310L350 368L245 310Z" stroke="#d7d6c9" strokeOpacity=".45" />
            <path d="M315 290L350 272L390 294V322L350 344L315 321Z" fill="#123d31" stroke="#b4c0af" />
            <path d="M452 346L478 331V345L452 360ZM420 363L443 351V365L420 378Z" fill="#081e17" stroke="#b4c0af" />
            {[195, 505].map(x => <ellipse key={x} cx={x} cy="311" rx="7" ry="4" fill="#b4c0af" />)}
          </g>
        ))}
        {[0,1,2,3,4,5,6].map(i => <path key={i} d={`M${290+i*15} ${200+i*8}V${177+i*8}L${350+i*15} ${145+i*8}V${168+i*8}Z`} fill="#a5b0a3" stroke="#53634e" />)}
      </svg>
    </div>
  );
}
