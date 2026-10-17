import styles from './HardwareLoading.module.css';
export default function HardwareLoading(){
  return <div className={styles.loading} role="status" aria-live="polite">
    <span className={styles.mark} aria-hidden="true">C2C / DONANIM</span>
    <p>Donanım görünümü hazırlanıyor.</p>
    <span>Bileşenler yüklendiğinde model birlikte gösterilir.</span>
  </div>;
}
