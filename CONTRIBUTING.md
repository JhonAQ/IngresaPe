# 🤝 Guía de contribución

¡Gracias por interesarte en mejorar Ingresa.pe! Este documento describe el flujo de trabajo que seguimos para mantener el código limpio, consistente y fácil de evolucionar.

## Flujo de trabajo

1. **Fork** el repositorio (si eres externo) o crea una rama desde `main`.
2. Crea una rama con un nombre descriptivo:
   - `feat/nombre-de-la-feature`
   - `fix/nombre-del-bug`
   - `docs/lo-que-se-documenta`
   - `refactor/lo-que-se-mejora`
3. Realiza tus cambios en commits pequeños y claros.
4. Asegúrate de que pasen los checks locales antes de abrir el PR.
5. Abre un **Pull Request** usando la plantilla del repo.
6. Solicita revisión y resuelve los comentarios.

## Convenciones de commits

Usamos mensajes de commit en español o inglés, preferiblemente con prefijo:

```
feat: agrega selector de cursos inmersivo
fix: corrige desbloqueo de nodos al terminar sesión
docs: actualiza CURRENT_STATE.md
refactor: simplifica buildActivities en TopicList
test: agrega tests para auth.router
chore: actualiza dependencias
```

## Checks obligatorios antes de un PR

```bash
# Formato
npx nx format:check

# Lint
npx nx run-many -t lint --all

# Type check
npx nx run-many -t typecheck --all

# Tests
npx nx run-many -t test --all

# Build
npx nx run-many -t build --all
```

## Estructura de código

- **Frontend:** componentes en `apps/web/src/components/<feature>/`.
- **Backend:** lógica en `apps/api/src/app/routers/` y servicios en `apps/api/src/app/services/`.
- **Dominio compartido:** tipos y schemas Zod en `libs/domain/src/lib/`.
- **UI compartida:** componentes reutilizables en `libs/ui/src/lib/`.

## Estilo

- Formato automático con Prettier.
- ESLint con reglas de TypeScript, React y NestJS.
- Tailwind CSS para estilos; priorizamos mobile-first y el diseño gamificado de Duolingo.

## Reportar bugs o proponer features

Usa las plantillas de GitHub Issues:

- 🐛 [Reportar un bug](./issues/new?template=bug_report.md)
- ✨ [Proponer una feature](./issues/new?template=feature_request.md)

## Código de conducta

Mantén un ambiente respetuoso y constructivo. No se tolera acoso, discriminación ni lenguaje ofensivo.

## Preguntas

Si tienes dudas, abre un issue con la etiqueta `question` o escribe a contacto@ingresa.pe.
