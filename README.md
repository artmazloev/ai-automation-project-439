# Автоматизация разбора файлов


[![hexlet-check](https://github.com/artmazloev/ai-automation-project-439/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artmazloev/ai-automation-project-439/actions)

Напишите консольную программу на JavaScript, которая разбирает папку с документами
компании: определяет тип каждого файла, находит дубликаты, отделяет полезные документы
от посторонних и собирает реестр. Отдельная команда сводит выгрузки контактов из разных
источников в одну таблицу — приводит колонки к единому виду, нормализует телефоны
и email, убирает повторы.

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-automation


## Стек

- JavaScript (Node.js 22+, ES-модули)
- [commander](https://github.com/tj/commander.js) — разбор аргументов и справка
- ESLint — линтер

## Установка

Нужны Node.js 22+ и Git.

```bash
git clone https://github.com/artmazloev/ai-automation-project-439.git
cd ai-automation-project-439
npm ci        # или make install
npm link      # команда file-automation появится в системе
```

Данные компании в репозиторий не входят (папка `company-files/` в `.gitignore`), их кладут рядом с кодом:

```bash
git clone --depth 1 https://github.com/hexlet-components/data-company-files.git
mv data-company-files/company-files company-files
rm -rf data-company-files
```

Линтер запускается одной командой:

```bash
npm run lint  # или make lint
```

## Использование

```bash
file-automation                                          # справка
file-automation files ./company-files [--out ./out]      # реестр документов
file-automation contacts ./company-files [--out ./out]   # чистая таблица контактов
```

Параметр `--out` задаёт папку результата, по умолчанию `./out`.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
