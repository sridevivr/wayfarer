# Tests

Jest + React Native Testing Library. Folder structure mirrors the source tree
so a test file always sits at the same path as the module it covers.

```
__tests__/
  components/      components/*.js
  app/             app/**/*.js (screens)
  services/        services/*.js   (M5+)
  hooks/           hooks/*.js      (M5+)
  storage/         storage/*.js    (M5+)
```

Run:

```
npm test            # one-shot
npm run test:watch  # watch mode
```

Every milestone adds tests alongside its code: rendering, navigation
intents, and any pure logic (step calculations, matchers, reducers).
