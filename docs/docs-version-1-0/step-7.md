# 👨‍🍳 Etap 7: System Operacyjny Kuchni i Real-time

Celem tego etapu jest stworzenie centrum operacyjnego dla pracowników i menadżerów. To tutaj dzieje się "magia" realizacji zamówień. Zastosujemy rozwiązania, które są w pełni kompatybilne z infrastrukturą **Vercel** (serverless), rezygnując z tradycyjnych WebSocketów na rzecz stabilnych usług zewnętrznych lub wydajnego pollingu.

---

## 7.1. Panel Zamówień LIVE (Karta Operacyjna)

Zgodnie ze specyfikacją, jest to jedyny widok, którego nie widzi Administrator aplikacji, a widzą go jedynie Menadżerowie i Pracownicy przypisani do danej lokalizacji.

### Implementacja Real-time na Vercel:

Vercel działa w architekturze Serverless, co uniemożliwia standardowe korzystanie z `socket.io`. Zastosujemy jedną z trzech opcji (zalecana Opcja A lub C):

- **Opcja A (Supabase Realtime):** Wykorzystuje mechanizm replikacji bazy danych. Gdy zmienia się rekord w tabeli `Order`, frontend dostaje powiadomienie.
- **Opcja B (Pusher):** Prosta usługa WebSockets as a Service – idealna pod Next.js.
- **Opcja C (TanStack Query / SWR Polling):** Najbezpieczniejsza na Vercel. Frontend co 5-10 sekund wysyła zapytanie do API: „Czy są nowe zamówienia?”. Dla małej/średniej restauracji jest to całkowicie wystarczające i darmowe.

### Funkcjonalności Panelu:

- **Kolejka zamówień:** Czytelne karty zamówień posegregowane od najstarszych (lub o najwyższym priorytecie).
- **Audio-wizualne powiadomienia:** Nowe zamówienie (`status: NOWE`) musi wywołać dźwięk „dzwonka” w kuchni oraz pulsowanie ramki karty zamówienia.
- **Akcje na karcie:**
  - Przycisk "Przyjmij" -> zmienia status na `W trakcie przygotowania`.
  - Przycisk "Gotowe" -> zmienia status na `Gotowe` (wysyła powiadomienie do klienta).
- **Filtrowanie:** Podgląd zamówień bieżących vs. historia z dzisiejszego dnia.

---

## 7.2. Manager Czasu (ETA Engine)

System automatycznie wspiera personel w określaniu czasu oczekiwania, co przekłada się na lepsze doświadczenie klienta.

- **Automatyczne obliczanie czasu:**
  - System pobiera `preparationTime` każdego dania w zamówieniu (np. 15 min, 20 min).
  - Bierze najwyższą wartość bazową i dodaje narzut zależny od **kolejki**: np. każde 2 zamówienia już będące "W przygotowaniu" dodają 5 minut do czasu startowego.
- **Manualny Override (Ustawienie ręczne):**
  - Pracownik w panelu statusów może jednym kliknięciem zwiększyć/zmniejszyć „średni czas realizacji” dla całego lokalu (np. podczas nagłego dużego ruchu – dodanie +15 min do każdego nowego zamówienia).
- **Zasada działania:** Obliczony czas (np. 45 min) jest przesyłany do bazy i wyświetlany w profilu klienta jako: _"Przewidywany czas dostawy/odbioru: 14:30"_.

---

## 7.3. Display Board (McDonald’s Mode)

Dedykowana strona dla restauracji serwujących posiłki na miejscu lub z odbiorem własnym.

- **Routing:** `/status-board/[locationId]` – widok publiczny, ale bez panelu bocznego i nawigacji.
- **Layout (Full Screen):** Podział ekranu na dwie kolumny (zgodnie ze specyfikacją):
  - **W PRZYGOTOWANIU (In Progress):** Lista numerów zamówień o statusie `W trakcie`.
  - **DO ODBIORU (Ready):** Duże, wyraźne numery o statusie `Gotowe`.
- **Mechanizm czyszczenia:** Po kliknięciu przez pracownika statusu `Odebrane`, numer zamówienia znika z tablicy.
- **Intuicyjność:** Każdy status powinien mieć swój dedykowany kolor, aby klient z daleka widział postęp.

---

## 7.4. Zarządzanie Statystykami (Dla Właściciela i Managera)

Podsumowanie dnia widoczne w głównym panelu restauracji (str. 8 i 9 specyfikacji).

- **Dashboard dzienny:** Licznik aktualnie zarobionych pieniędzy, liczba sprzedanych posiłków i liczba pracowników na zmianie.
- **Filtrowanie statystyk:** Możliwość podejrzenia wyników sprzedaży w zadanym okresie (po dacie).
- **Wykres sprzedaży:** Prosta wizualizacja godzinowa – w jakich godzinach jest najwięcej zamówień.

---

## ✅ Kryteria zakończenia Etapu 7:

1.  **Działający Polling/Real-time:** Nowe zamówienie opłacone przez klienta pojawia się na ekranie tabletu w kuchni bez konieczności odświeżania strony przez pracownika.
2.  **Audio Alert:** System wydaje dźwięk po nadejściu nowego zamówienia (ważne: przeglądarki wymagają pierwszej interakcji użytkownika, by odtworzyć dźwięk).
3.  **McDonald's Display:** Widok tablicy pod `/status-board` poprawnie rozdziela zamówienia na "W trakcie" i "Gotowe".
4.  **Time Logic:** Czas dostawy wyświetlany klientowi reaguje na manualne zmiany wprowadzone przez menadżera w panelu lokalu.
5.  **Logi zmian:** Każda zmiana statusu zapisuje się w bazie z timestampem (dla celów analitycznych: jak długo faktycznie trwało przygotowanie dania).

---

### Porada pod Vercel:

W przypadku darmowej wersji Vercel, funkcje Serverless mogą zostać „uśpione”. Upewnij się, że Dashboard restauracji używa mechanizmu `refreshInterval` (np. w bibliotece **SWR** lub **TanStack Query**), aby zapobiec przerwaniu połączenia i upewnić się, że dane są zawsze świeże:

```typescript
const { data: orders } = useQuery(["orders", locationId], fetchOrders, {
  refetchInterval: 10000, // odświeżaj co 10 sekund - bezpieczne dla limitów Vercela
});
```
