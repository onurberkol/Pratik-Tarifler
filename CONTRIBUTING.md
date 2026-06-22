# Contributing to Pratik Tarifler

> ⚠️ **NOT:** Bu proje özel (proprietary) bir projedir. Harici katkı kabul edilmemektedir. Bu doküman dahili ekip için yazılmıştır.

## Geliştirme Akışı

1. `develop` branch'inden yeni branch oluştur: `feature/admin-bulk-import`
2. Değişiklikleri yap, commit'le (Conventional Commits formatında)
3. Pull Request aç → `develop`'a merge
4. Sürüm hazır olduğunda `develop` → `main` PR

## Commit Mesaj Formatı

```
type(scope): kısa açıklama

[opsiyonel detay]
```

Tipler: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Örnekler:
- `feat(admin): Add bulk recipe import via JSON`
- `fix(mobile): Image cache invalidation in cooking mode`
- `docs(handoff): Update Firebase setup guide`

## Branch Adlandırma

- `feature/...` — Yeni özellik
- `fix/...` — Bug fix
- `docs/...` — Sadece dokümantasyon
- `chore/...` — Dependency güncellemeleri, CI, vb.

## Code Review Kuralları

- En az 1 onay gerekir (founder veya tech lead)
- TypeScript hatasız olmalı
- Lint geçmeli
- Test eklenmiş olmalı (mümkünse)
