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
      name: 'frontend-cannot-import-backend',
      severity: 'error',
      comment: 'frontend must not import internal code or types from backend; communicate via OpenAPI / typed client only.',
      from: {
        path: '^frontend',
      },
      to: {
        path: '^backend',
      },
    },
    {
      name: 'modules-internal-isolation',
      severity: 'error',
      comment: 'Modules must only import from another module through its public index.ts interface.',
      from: {
        path: '^backend/src/modules/([^/]+)/',
      },
      to: {
        path: '^backend/src/modules/([^/]+)/',
        pathNot: ['^backend/src/modules/$1/', '^backend/src/modules/[^/]+/index\\.ts$'],
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
