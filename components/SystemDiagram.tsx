/** Original engineering schematics, not footage or evidence of delivered projects. */
export default function SystemDiagram({ kind }: { kind: 'vision' | 'industrial' | 'software' }) {
  return (
    <svg viewBox="0 0 720 460" className={`system-diagram diagram-${kind}`} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2">
        {kind === 'vision' ? <>
          <path data-draw d="M85 270H245L330 185H492V245H635" />
          <g data-mechanism>
            <path d="M64 156L175 128L231 163V247L119 275L64 240Z" fill="var(--diagram-fill)" />
            <path d="M64 156L119 192L231 163M119 192V275M175 128V103H198V140" />
            <ellipse cx="175" cy="217" rx="31" ry="39" transform="rotate(17 175 217)" />
            <ellipse cx="175" cy="217" rx="19" ry="25" transform="rotate(17 175 217)" stroke="var(--gold)" />
            <path d="M84 178V231M94 185V238M104 192V245" opacity=".5" />
          </g>
          <path data-draw d="M320 100H590V335H320V100Z" strokeDasharray="4 8" opacity=".35" />
          <g data-mechanism><path d="M408 250V210Q410 186 430 186Q450 186 452 210V250M415 250L410 294M445 250L450 294" /><circle cx="430" cy="168" r="14" /><path d="M386 136V120H405M454 120H473V136M386 275V310H405M454 310H473V275" stroke="var(--gold)" /></g>
          <path data-draw d="M348 225H562" stroke="var(--gold)" />
          <circle cx="635" cy="245" r="8" fill="var(--gold)" stroke="none" />
        </> : kind === 'industrial' ? <>
          <path data-draw d="M65 310H653M85 330H632M125 330L108 367M590 330L607 367" />
          {[160, 280, 400, 520].map((x, index) => <g data-mechanism key={x}>
            <path d={`M${x} 249L${x + 40} 228L${x + 79} 249V291L${x + 40} 311L${x} 291Z`} fill="var(--diagram-fill)" stroke={index === 2 ? 'var(--gold)' : 'currentColor'} />
            <path d={`M${x} 249L${x + 40} 270L${x + 79} 249M${x + 40} 270V311`} opacity=".55" />
          </g>)}
          <g data-mechanism><path d="M345 90H415V139H345ZM380 139V164M361 164H399L410 188H350Z" fill="var(--diagram-fill)" /><path d="M325 85V65H435V85M435 65H477V304" /></g>
          <path data-draw d="M355 200L330 292M405 200L430 292M320 213H440V307H320Z" stroke="var(--gold)" />
          <path data-draw d="M478 130H591V192" /><circle cx="591" cy="204" r="8" fill="var(--gold)" stroke="none" />
        </> : <>
          <path data-draw d="M75 166H260V234H455V140H637M75 302H260V234M455 234V330H637" />
          <g data-mechanism><path d="M263 161L357 116L454 161V299L357 345L263 299Z" fill="var(--diagram-fill)" /><path d="M263 161L357 207L454 161M357 207V345" />
            {[0,1,2,3].map(i=><path key={i} d={`M277 ${184+i*25}L342 ${216+i*25}M374 ${215+i*25}L440 ${183+i*25}`} opacity=".6" />)}
          </g>
          <path data-draw d="M330 159L357 145L385 159L357 174Z" stroke="var(--gold)" />
          {[['75','166'],['75','302'],['637','140'],['637','330']].map(([cx,cy])=><circle key={cy+cx} cx={cx} cy={cy} r="9" fill="var(--diagram-fill)" />)}
          <circle cx="455" cy="234" r="5" fill="var(--gold)" stroke="none" />
        </>}
      </g>
      <g className="diagram-annotations" fill="currentColor">
        <text x="64" y="412">{kind === 'vision' ? 'GÖRÜNTÜ' : kind === 'industrial' ? 'ÜRÜN / PARÇA' : 'VERİ KAYNAĞI'}</text>
        <text x="356" y="412" textAnchor="middle">{kind === 'vision' ? 'OLAY ANALİZİ' : kind === 'industrial' ? 'GÖRSEL KONTROL' : 'İŞ MANTIĞI'}</text>
        <text x="654" y="412" textAnchor="end">{kind === 'vision' ? 'BİLDİRİM' : kind === 'industrial' ? 'İNCELEME KAYDI' : 'ENTEGRASYON'}</text>
      </g>
    </svg>
  );
}
