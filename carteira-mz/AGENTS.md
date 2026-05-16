# Instruções para Agentes

## Responsividade Mobile

Não resolva cortando tudo com overflow-hidden de forma cega. O overflow horizontal global deve desaparecer, mas a secção "Minhas Contas" precisa continuar com scroll horizontal funcional. O problema deve ser resolvido ajustando larguras, wrappers, min-w-0, shrink-0 nos cards horizontais e removendo w-screen/100vw onde estiver errado.
