# Автоматизация разбора файлов


[![hexlet-check](https://github.com/artmazloev/ai-automation-project-439/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artmazloev/ai-automation-project-439/actions)

Напишите консольную программу на JavaScript, которая разбирает папку с документами
компании: определяет тип каждого файла, находит дубликаты, отделяет полезные документы
от посторонних и собирает реестр. Отдельная команда сводит выгрузки контактов из разных
источников в одну таблицу — приводит колонки к единому виду, нормализует телефоны
и email, убирает повторы.

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-automation


## Стек

- Node.js 22+
- commander
- as-table
- ESLint

## Установка

```bash
git clone https://github.com/artmazloev/ai-automation-project-439.git
cd ai-automation-project-439
make setup
```

Папку с файлами компании нужно положить рядом с кодом, в git она не попадает:

```bash
git clone --depth 1 https://github.com/hexlet-components/data-company-files.git
mv data-company-files/company-files company-files
rm -rf data-company-files
```

Линтер: `make lint`

## Использование

```bash
file-automation files ./company-files --out ./out
file-automation contacts ./company-files --out ./out
```

`--out` можно не указывать, по умолчанию результат пишется в `./out`.

```
$ file-automation files ./company-files
Файлов найдено: 40
Табличных документов: 21, текстовых: 8, непарсимых: 11
Документов: 28, требуют ручного разбора: 7, посторонних: 5
Копий найдено: 5 в 3 группах
Реестр: out/registry.csv
Отчёт: out/report.txt
Отчёт для программ: out/report.json

$ file-automation contacts ./company-files
anketa-konferencii.csv: записей 32
crm-arhiv.json: записей 27
kontakty-crm.csv: записей 36
kontakty-vebinar.csv: записей 36
kontakty-rassylka.csv: записей 24
Выгрузок прочитано: 5, записей: 155
Уникальных контактов: 113
Отбраковано значений: 11, записей без телефона и почты: 5
Колонки без соответствия: Должность (anketa-konferencii.csv), company (crm-arhiv.json)
Таблица: out/contacts.csv
Отчёт: out/report.txt
Отчёт для программ: out/report.json
```

Что получается в папке результата:

- `registry.csv` - реестр файлов: тип, размер, хеш, статус, ссылка на основную копию, число строк и колонки у таблиц;
- `contacts.csv` - контакты без повторов: имя, телефон, почта, источники;
- `report.txt` - отчёт для человека;
- `report.json` - то же самое в json.

Контакты склеиваются по телефону, если телефона нет, то по почте. Если у одного человека в одной выгрузке есть и телефон, и почта, а в другой только почта, это будет одна строка.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
