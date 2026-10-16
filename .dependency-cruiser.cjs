/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are strictly forbidden.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'web-cannot-import-api',
      severity: 'error',
      comment: 'apps/web must not import internal code or types from apps/api; communicate via packages/contracts only.',
      from: {
        path: '^apps/web',
      },
      to: {
        path: '^apps/api',
      },
    },
    {
      name: 'modules-internal-isolation',
      severity: 'error',
      comment: 'Modules must only import from another module through its public index.ts interface.',
      from: {
        path: '^apps/api/src/modules/([^/]+)/',
      },
      to: {
        path: '^apps/api/src/modules/([^/]+)/',
        pathNot: ['^apps/api/src/modules/$1/', '^apps/api/src/modules/[^/]+/index\\.ts$'],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
  },
};
