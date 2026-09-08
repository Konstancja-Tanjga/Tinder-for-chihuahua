import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Nasluchuj na wszystkich interfejsach, zeby telefon w tej samej sieci trafil.
    host: true,
    port: 5173,
    // Vite ma ochrone przed DNS rebinding i odrzuca nieznane nazwy hostow z 403.
    // Dopuszczamy nazwy Bonjour (*.local), bo adres IP zmienia sie przy kazdym
    // odnowieniu DHCP -- a nazwa maszyny nie. To realnie sie zdarzylo w trakcie
    // pierwszej proby na telefonie: 192.168.1.124 przestal istniec w trakcie sesji.
    allowedHosts: ['.local'],
  },
});
