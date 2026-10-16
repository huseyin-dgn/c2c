export const demoScenarios = [
  { id:'intrusion', name:'Alan ihlali', title:'Sınırı geçen olay.', description:'Tanımlı alana giriş, olay adayı olarak işaretlenir. İş kuralları ve insan incelemesi sonraki adımı belirler.' },
  { id:'counting', name:'Kişi / araç sayımı', title:'Çizgiden geçen hareket.', description:'Takip edilen nesnenin sayım çizgisini geçişi bir kez sayılır. Kişi ve araç sayaçları ayrı tutulur.' },
  { id:'equipment', name:'İş güvenliği', title:'Ekipman kontrolü.', description:'Baret veya yelek kullanımı için görsel kontrol adayı oluşturulur. Bu örnekte donanım ve kişilerin durumu önceden tanımlıdır.' },
  { id:'quality', name:'Kalite kontrol', title:'Ürün üzerindeki fark.', description:'Üretim hattındaki örnek kusur işaretlenir ve inceleme kaydı oluşturulur. İşaretler bir AI modelinin çıktısı değildir.' },
] as const;
export type DemoId = (typeof demoScenarios)[number]['id'];
export function demoFrame(id:DemoId, progress:number) {
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
  const personX=140+p*560,vehicleX=70+p*670,defectX=295+p*360;
  return { progress:p, personX, vehicleX, defectX,
    event:id==='intrusion'?personX>=475:id==='equipment'?personX>=300:id==='quality'?defectX+42>=450:false,
    people:id==='counting'&&personX>=450?1:0, vehicles:id==='counting'&&vehicleX>=450?1:0,
    eventLabel:id==='intrusion'?'Alan ihlali adayı':id==='equipment'?'Baret kontrolü adayı':id==='quality'?'Görsel kusur adayı':'Sayım çizgisi',
  };
}
