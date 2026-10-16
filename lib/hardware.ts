export const hardware = [
  { id: 'motherboard', name: 'Anakart', role: 'İşlemciyi, belleği, depolamayı ve genişleme kartlarını elektriksel veri yollarıyla birbirine bağlar.', connection: 'Bağımsız bileşenlerin tanımlı arayüzlerle birlikte çalışması, sistem entegrasyonu yaklaşımımızı anlatır.', activity: 'Bağlantı yolları', position: [0,0,0], lift: 0 },
  { id: 'cpu', name: 'CPU', role: 'Genel amaçlı komutları yürütür; algoritmaları, kontrol akışını ve karar mantığını işler.', connection: 'İş kurallarını ve karar algoritmalarını problemin gerektirdiği şekilde tasarlarız.', activity: 'Sıralı komut akışı', position: [0,.15,0], lift: .8 },
  { id: 'gpu', name: 'GPU', role: 'Birçok benzer hesabı paralel yürütür. Uygun modellerde yapay zekâ ve görüntü işleme yüklerini hızlandırabilir.', connection: 'Paralel işlemeyi, veri ve gecikme koşulları uygun olduğunda çözüm mimarisine dahil ederiz.', activity: 'Paralel işlem kanalları', position: [-.2,.53,1.73], lift: 1.05 },
  { id: 'ram', name: 'RAM', role: 'Çalışan programların ve anlık verilerin geçici belleğidir; güç kesildiğinde içeriği korunmaz.', connection: 'Anlık kamera karelerini ve ara sonuçları, bellek ve gecikme sınırlarını gözeterek işleriz.', activity: 'Bellek bankası erişimi', position: [1.89,.34,.049], lift: .9 },
  { id: 'ssd', name: 'SSD', role: 'Veriyi güç kapalıyken de koruyan kalıcı depolamadır. Burada M.2 biçimindeki bir modül gösterilir.', connection: 'Olay kayıtlarını ve uygulama verisini saklama, erişim ve veri sahipliği kurallarına göre ele alırız.', activity: 'Okuma / yazma akışı', position: [.42,.02,-1.79], lift: .65 },
  { id: 'cooling', name: 'Soğutma', role: 'Isıyı işlemciden soğutucuya ve çevre havasına aktarır; aşırı ısınmayı ve performans kısıtlanmasını önlemeye yardımcı olur.', connection: 'Sürdürülebilir performansı yalnızca işlem hızıyla değil kaynak kullanımı ve çalışma koşullarıyla değerlendiririz.', activity: 'Fan ve hava akışı', position: [0,.43,0], lift: 1.7 },
  { id: 'io', name: 'Güç ve I/O', role: 'Güç bağlantıları bileşenleri besler; I/O arayüzleri kameralar, ağ ve dış cihazlarla veri alışverişini sağlar.', connection: 'Kameraları, sensörleri ve dış servisleri erişim sınırları tanımlı arayüzlerle sisteme bağlarız.', activity: 'Dış sistem veri alışverişi', position: [-2.23,.01,-1.77], lift: .45 },
] as const;
export type HardwareId = (typeof hardware)[number]['id'];
export type Vector3Tuple = [number, number, number];
export function hardwarePosition(id: HardwareId, explosion: number): Vector3Tuple {
  const part = hardware.find(item => item.id === id)!;
  return [part.position[0], part.position[1] + part.lift * Math.max(0, Math.min(1, explosion)), part.position[2]];
}
