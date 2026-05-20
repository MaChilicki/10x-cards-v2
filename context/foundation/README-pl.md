# Dokumenty fundamentowe

Żywe dokumenty przekrojowe, które obejmują więcej niż jedną zmianę. Każdy projekt sam wybiera, których dokumentów fundamentowych potrzebuje, np. wymagań produktowych, stosu technologicznego, planu rozwoju, słownika pojęć albo strategii testów. Dokumenty fundamentowe są własnością skillów, które je czytają i zapisują. Ten README opisuje wspólne zasady dla wszystkich takich dokumentów.

## Zasada aktualizacji

**Edytujemy w miejscu.** Dokumenty fundamentowe rozwijają się przez cały czas życia projektu. Gdy zmienia się jakiś szczegół, np. zależność, cel produktu albo etap prac, aktualizujemy istniejący plik. Nie tworzymy datowanych kopii dla zwykłych zmian.

## Zasada archiwizacji

Gdy dokument fundamentowy zostaje w pełni zastąpiony nowym podejściem, a nie tylko doprecyzowany, przenosimy go do `foundation/archive/YYYY-MM-DD-<doc>.md` i zapisujemy nową wersję pod oryginalną ścieżką. Katalog archiwum jest zapisem historii. Standardowe skille nie czytają go rutynowo.

## Antywzorzec

Nie wkładamy tutaj dokumentów dotyczących pojedynczej zmiany. Plan, research, przegląd albo notatki dla jednej zmiany należą do `context/changes/<change-id>/`. `foundation` jest dla wiedzy, która przeżywa pojedyncze zmiany.
