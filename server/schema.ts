import z from 'zod'

const walletSchemas = {
  assets: {
    schema: z.object({
      name: z.string(),
      icon: z.string(),
      starting_balance: z.number()
    }),
    raw: {
      id: 'jb4b93uex7fgql5',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__assets',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '3dlavzvz',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'l5fof4bg',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'vjgjle4c',
          max: null,
          min: null,
          name: 'starting_balance',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_OU71dSp4TR` ON `wallet__assets` (`name`)'
      ],
      system: false
    }
  },
  ledgers: {
    schema: z.object({
      name: z.string(),
      icon: z.string(),
      color: z.string()
    }),
    raw: {
      id: '7tug66h7onrjdu2',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__ledgers',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'vy0zphs0',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'hocs7m6h',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'cwnz67zi',
          max: 0,
          min: 0,
          name: 'color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_sIL4a4Sdsi` ON `wallet__ledgers` (`name`)'
      ],
      system: false
    }
  },
  categories: {
    schema: z.object({
      name: z.string(),
      icon: z.string(),
      color: z.string(),
      type: z.enum(['income', 'expenses'])
    }),
    raw: {
      id: 'vr4lv9hatzgmgfz',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__categories',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '7r0hcrrv',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '7e68hxz8',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'gwfvhe0f',
          max: 0,
          min: 0,
          name: 'color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: '4rbyorhf',
          maxSelect: 1,
          name: 'type',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['income', 'expenses']
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_XO2dnVmg7Z` ON `wallet__categories` (\n  `name`,\n  `type`\n)'
      ],
      system: false
    }
  },
  transactions: {
    schema: z.object({
      type: z.enum(['transfer', 'income_expenses']),
      amount: z.number(),
      date: z.string(),
      receipt: z.string(),
      created: z.string(),
      updated: z.string()
    }),
    raw: {
      id: 'nk4p9hnqedrvmdi',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__transactions',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'ivm559pc',
          maxSelect: 1,
          name: 'type',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['transfer', 'income_expenses']
        },
        {
          hidden: false,
          id: '2wrkslxv',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '09rysqhc',
          max: '',
          min: '',
          name: 'date',
          presentable: false,
          required: false,
          system: false,
          type: 'date'
        },
        {
          hidden: false,
          id: 'gmdk5guf',
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: null,
          name: 'receipt',
          presentable: false,
          protected: false,
          required: false,
          system: false,
          thumbs: null,
          type: 'file'
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate'
        }
      ],
      indexes: [],
      system: false
    }
  },
  categories_aggregated: {
    schema: z.object({
      type: z.enum(['income', 'expenses']),
      name: z.string(),
      icon: z.string(),
      color: z.string(),
      amount: z.number()
    }),
    raw: {
      id: 'pbc_1833454015',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'wallet__categories_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: '_clone_43ie',
          maxSelect: 1,
          name: 'type',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['income', 'expenses']
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_KAav',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_R7zw',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_HxE1',
          max: 0,
          min: 0,
          name: 'color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number2392944706',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        'SELECT\n  wallet__categories.id,\n  wallet__categories.type,\n  wallet__categories.name,\n  wallet__categories.icon,\n  wallet__categories.color,\n  COUNT(wallet__transactions_income_expenses.id) AS amount\nFROM wallet__categories\nLEFT JOIN wallet__transactions_income_expenses ON wallet__transactions_income_expenses.category = wallet__categories.id\nGROUP BY wallet__categories.id'
    }
  },
  assets_aggregated: {
    schema: z.object({
      name: z.string(),
      icon: z.string(),
      starting_balance: z.number(),
      transaction_count: z.number(),
      current_balance: z.any()
    }),
    raw: {
      id: 'pbc_1777026265',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'wallet__assets_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_eWH4',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_qOLM',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: '_clone_cXlX',
          max: null,
          min: null,
          name: 'starting_balance',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number619353122',
          max: null,
          min: null,
          name: 'transaction_count',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'json117021307',
          maxSize: 1,
          name: 'current_balance',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        "WITH unified_transactions AS (\n  SELECT \n    id, \n    amount, \n    asset, \n    source \n  FROM \n    (\n      SELECT \n        CONCAT(\n          wallet__transactions.id, \"_\", wallet__transactions_income_expenses.type\n        ) as id, \n        wallet__transactions.amount,  \n        wallet__transactions_income_expenses.asset, \n        wallet__transactions_income_expenses.type as source \n      FROM \n        wallet__transactions_income_expenses\n        JOIN wallet__transactions ON wallet__transactions_income_expenses.base_transaction = wallet__transactions.id \n      UNION \n      SELECT  \n        concat(wallet__transactions.id, \"_out\") as id, \n        wallet__transactions.amount as amount, \n        wallet__transactions_transfer.\"from\" as asset, \n        'transfer_out' as source\n      FROM \n        wallet__transactions_transfer \n        JOIN wallet__transactions ON wallet__transactions_transfer.base_transaction = wallet__transactions.id \n      UNION \n      SELECT \n        concat(wallet__transactions.id, \"_in\") as id, \n        wallet__transactions.amount, \n        wallet__transactions_transfer.\"to\" as asset, \n        'transfer_in' as source \n      FROM \n        wallet__transactions_transfer \n        JOIN wallet__transactions ON wallet__transactions_transfer.base_transaction = wallet__transactions.id\n    )\n) \nSELECT \n  wallet__assets.id, \n  wallet__assets.name,\n  wallet__assets.icon,\n  wallet__assets.starting_balance,\n  COUNT(unified_transactions.id) AS transaction_count, \n  ROUND(\n    wallet__assets.starting_balance + SUM(\n      CASE \n        WHEN source = 'transfer_out' THEN - amount \n        WHEN source = 'transfer_in' THEN amount \n        WHEN source = 'income' THEN amount \n        WHEN source = 'expenses' THEN - amount \n        ELSE 0 \n      END\n    ), \n    2\n  ) AS current_balance \nFROM \n  unified_transactions \n  RIGHT JOIN wallet__assets ON wallet__assets.id = unified_transactions.asset \nGROUP BY \n  wallet__assets.id\n"
    }
  },
  ledgers_aggregated: {
    schema: z.object({
      name: z.string(),
      color: z.string(),
      icon: z.string(),
      amount: z.number()
    }),
    raw: {
      id: 'pbc_192729987',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'wallet__ledgers_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_FWIh',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_3nKF',
          max: 0,
          min: 0,
          name: 'color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_4Inc',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number2392944706',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        'WITH transaction_ledger_map AS (\n  SELECT\n    wallet__transactions_income_expenses.id AS transaction_id,\n    json_each.value AS ledger_id\n  FROM\n    wallet__transactions_income_expenses,\n    json_each(wallet__transactions_income_expenses.ledgers)\n)\nSELECT\n  wallet__ledgers.id,\n  wallet__ledgers.name,\n  wallet__ledgers.color,\n  wallet__ledgers.icon,\n  COUNT(transaction_ledger_map.transaction_id) AS amount\nFROM\n  wallet__ledgers\nLEFT JOIN transaction_ledger_map\n  ON transaction_ledger_map.ledger_id = wallet__ledgers.id\nGROUP BY\n  wallet__ledgers.id;'
    }
  },
  transaction_types_aggregated: {
    schema: z.object({
      name: z.any(),
      transaction_count: z.number(),
      accumulated_amount: z.any()
    }),
    raw: {
      id: 'pbc_4127888515',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'wallet__transaction_types_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'json1579384326',
          maxSize: 1,
          name: 'name',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'number619353122',
          max: null,
          min: null,
          name: 'transaction_count',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'json492355399',
          maxSize: 1,
          name: 'accumulated_amount',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        'SELECT\n  (ROW_NUMBER() OVER()) as id,\n  (\n  CASE WHEN wallet__transactions.type = \'transfer\' THEN "transfer"\n  ELSE wallet__transactions_income_expenses.type\n  END\n  ) as name,\n  COUNT(wallet__transactions.id) as transaction_count,\n  SUM(wallet__transactions.amount) as accumulated_amount\nFROM wallet__transactions\nLEFT JOIN wallet__transactions_income_expenses\n  ON wallet__transactions.id = wallet__transactions_income_expenses.base_transaction\nLEFT JOIN wallet__transactions_transfer\n  ON wallet__transactions.id = wallet__transactions_transfer.base_transaction\nGROUP BY name\n'
    }
  },
  transactions_income_expenses: {
    schema: z.object({
      base_transaction: z.string(),
      type: z.enum(['income', 'expenses']),
      particulars: z.string(),
      asset: z.string(),
      category: z.string(),
      ledgers: z.array(z.string()),
      location_name: z.string(),
      location_coords: z.object({ lat: z.number(), lon: z.number() })
    }),
    raw: {
      id: 'pbc_1561892026',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__transactions_income_expenses',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          cascadeDelete: true,
          collectionId: 'nk4p9hnqedrvmdi',
          hidden: false,
          id: 'relation2064839465',
          maxSelect: 1,
          minSelect: 0,
          name: 'base_transaction',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          hidden: false,
          id: 'select2363381545',
          maxSelect: 1,
          name: 'type',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['income', 'expenses']
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text2250334671',
          max: 0,
          min: 0,
          name: 'particulars',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          cascadeDelete: true,
          collectionId: 'jb4b93uex7fgql5',
          hidden: false,
          id: 'relation45046364',
          maxSelect: 1,
          minSelect: 0,
          name: 'asset',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          cascadeDelete: false,
          collectionId: 'vr4lv9hatzgmgfz',
          hidden: false,
          id: 'relation105650625',
          maxSelect: 1,
          minSelect: 0,
          name: 'category',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          cascadeDelete: false,
          collectionId: '7tug66h7onrjdu2',
          hidden: false,
          id: 'relation3642313480',
          maxSelect: 999,
          minSelect: 0,
          name: 'ledgers',
          presentable: false,
          required: false,
          system: false,
          type: 'relation'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3727149894',
          max: 0,
          min: 0,
          name: 'location_name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'geoPoint2468307335',
          name: 'location_coords',
          presentable: false,
          required: false,
          system: false,
          type: 'geoPoint'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_1SR25MNndH` ON `wallet__transactions_income_expenses` (`base_transaction`)'
      ],
      system: false
    }
  },
  transactions_transfer: {
    schema: z.object({
      base_transaction: z.string(),
      from: z.string(),
      to: z.string()
    }),
    raw: {
      id: 'pbc_3108707677',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__transactions_transfer',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          cascadeDelete: true,
          collectionId: 'nk4p9hnqedrvmdi',
          hidden: false,
          id: 'relation2064839465',
          maxSelect: 1,
          minSelect: 0,
          name: 'base_transaction',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          cascadeDelete: true,
          collectionId: 'jb4b93uex7fgql5',
          hidden: false,
          id: 'relation3957184672',
          maxSelect: 1,
          minSelect: 0,
          name: 'from',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          cascadeDelete: true,
          collectionId: 'jb4b93uex7fgql5',
          hidden: false,
          id: 'relation2040861836',
          maxSelect: 1,
          minSelect: 0,
          name: 'to',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_GwG14gsDmZ` ON `wallet__transactions_transfer` (`base_transaction`)'
      ],
      system: false
    }
  },
  transaction_templates: {
    schema: z.object({
      name: z.string(),
      type: z.enum(['income', 'expenses']),
      amount: z.number(),
      particulars: z.string(),
      asset: z.string(),
      category: z.string(),
      ledgers: z.array(z.string()),
      location_name: z.string(),
      location_coords: z.object({ lat: z.number(), lon: z.number() })
    }),
    raw: {
      id: 'pbc_3992347949',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__transaction_templates',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text1579384326',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: true,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'select2363381545',
          maxSelect: 1,
          name: 'type',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['income', 'expenses']
        },
        {
          hidden: false,
          id: 'number2392944706',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text273887563',
          max: 0,
          min: 0,
          name: 'particulars',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          cascadeDelete: true,
          collectionId: 'jb4b93uex7fgql5',
          hidden: false,
          id: 'relation45046364',
          maxSelect: 1,
          minSelect: 0,
          name: 'asset',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          cascadeDelete: false,
          collectionId: 'vr4lv9hatzgmgfz',
          hidden: false,
          id: 'relation105650625',
          maxSelect: 1,
          minSelect: 0,
          name: 'category',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          cascadeDelete: false,
          collectionId: '7tug66h7onrjdu2',
          hidden: false,
          id: 'relation3642313480',
          maxSelect: 999,
          minSelect: 0,
          name: 'ledgers',
          presentable: false,
          required: false,
          system: false,
          type: 'relation'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3727149894',
          max: 0,
          min: 0,
          name: 'location_name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'geoPoint2468307335',
          name: 'location_coords',
          presentable: false,
          required: false,
          system: false,
          type: 'geoPoint'
        }
      ],
      indexes: [],
      system: false
    }
  },
  transactions_prompts: {
    schema: z.object({
      income: z.string(),
      expenses: z.string()
    }),
    raw: {
      id: 'pbc_4111428197',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__transactions_prompts',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text1067999952',
          max: 999999999999999,
          min: 0,
          name: 'income',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text613872475',
          max: 999999999999999,
          min: 0,
          name: 'expenses',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        }
      ],
      indexes: [],
      system: false
    }
  },
  expenses_location_aggregated: {
    schema: z.object({
      lat: z.any(),
      lng: z.any(),
      locationName: z.string(),
      amount: z.any(),
      count: z.number()
    }),
    raw: {
      id: 'pbc_3200607087',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'wallet__expenses_location_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'json2499937429',
          maxSize: 1,
          name: 'lat',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json2518964612',
          maxSize: 1,
          name: 'lng',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_QE0d',
          max: 0,
          min: 0,
          name: 'locationName',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'json2392944706',
          maxSize: 1,
          name: 'amount',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'number2245608546',
          max: null,
          min: null,
          name: 'count',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        "SELECT\n  (ROW_NUMBER() OVER()) as id,\n  json_extract(wallet__transactions_income_expenses.location_coords, '$.lat') AS lat,\n  json_extract(wallet__transactions_income_expenses.location_coords, '$.lon') AS lng,\n  wallet__transactions_income_expenses.location_name AS locationName,\n  SUM(wallet__transactions.amount) AS amount,\n  COUNT(*) AS count\nFROM wallet__transactions_income_expenses\nINNER JOIN wallet__transactions \n  ON wallet__transactions_income_expenses.base_transaction = wallet__transactions.id\nWHERE \n  wallet__transactions_income_expenses.type = 'expenses'\n  AND wallet__transactions_income_expenses.location_name IS NOT NULL\n  AND wallet__transactions_income_expenses.location_name != ''\n  AND json_extract(wallet__transactions_income_expenses.location_coords, '$.lat') IS NOT NULL\n  AND json_extract(wallet__transactions_income_expenses.location_coords, '$.lat') != 0\n  AND json_extract(wallet__transactions_income_expenses.location_coords, '$.lon') IS NOT NULL\n  AND json_extract(wallet__transactions_income_expenses.location_coords, '$.lon') != 0\nGROUP BY \n  json_extract(wallet__transactions_income_expenses.location_coords, '$.lat'),\n  json_extract(wallet__transactions_income_expenses.location_coords, '$.lon'),\n  wallet__transactions_income_expenses.location_name"
    }
  },
  transactions_amount_aggregated: {
    schema: z.object({
      year: z.number(),
      month: z.number(),
      date: z.number(),
      income: z.any(),
      expenses: z.any(),
      transfer: z.any(),
      income_count: z.any(),
      expenses_count: z.any(),
      transfer_count: z.any()
    }),
    raw: {
      id: 'pbc_322615261',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'wallet__transactions_amount_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number3145888567',
          max: null,
          min: null,
          name: 'year',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2394296326',
          max: null,
          min: null,
          name: 'month',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2862495610',
          max: null,
          min: null,
          name: 'date',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'json1067999952',
          maxSize: 1,
          name: 'income',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json613872475',
          maxSize: 1,
          name: 'expenses',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json1077191616',
          maxSize: 1,
          name: 'transfer',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json1506083771',
          maxSize: 1,
          name: 'income_count',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json3243452931',
          maxSize: 1,
          name: 'expenses_count',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json643674426',
          maxSize: 1,
          name: 'transfer_count',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        "WITH all_transactions AS (\n  SELECT\n    DATE(wallet__transactions.date) AS date_key,\n    wallet__transactions_income_expenses.type AS transaction_type,\n    wallet__transactions.amount AS amount\n  FROM wallet__transactions_income_expenses\n  INNER JOIN wallet__transactions \n    ON wallet__transactions_income_expenses.base_transaction = wallet__transactions.id\n  UNION ALL\n  SELECT\n    DATE(wallet__transactions.date) AS date_key,\n    'transfer' AS transaction_type,\n    wallet__transactions.amount AS amount\n  FROM wallet__transactions_transfer\n  INNER JOIN wallet__transactions \n    ON wallet__transactions_transfer.base_transaction = wallet__transactions.id\n)\nSELECT\n  (ROW_NUMBER() OVER()) as id,\n  CAST(strftime('%Y', date_key) AS INTEGER) AS year,\n  CAST(strftime('%m', date_key) AS INTEGER) AS month,\n  CAST(strftime('%d', date_key) AS INTEGER) AS date,\n  SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) AS income,\n  SUM(CASE WHEN transaction_type = 'expenses' THEN amount ELSE 0 END) AS expenses,\n  SUM(CASE WHEN transaction_type = 'transfer' THEN amount ELSE 0 END) AS transfer,\n  SUM(CASE WHEN transaction_type = 'income' THEN 1 ELSE 0 END) AS income_count,\n  SUM(CASE WHEN transaction_type = 'expenses' THEN 1 ELSE 0 END) AS expenses_count,\n  SUM(CASE WHEN transaction_type = 'transfer' THEN 1 ELSE 0 END) AS transfer_count\nFROM all_transactions\nGROUP BY date_key"
    }
  },
  budgets: {
    schema: z.object({
      category: z.string(),
      amount: z.number(),
      rollover_enabled: z.boolean(),
      rollover_cap: z.number(),
      alert_thresholds: z.any(),
      is_active: z.boolean(),
      year: z.number(),
      month: z.number(),
      created: z.string(),
      updated: z.string()
    }),
    raw: {
      id: 'pbc_wallet_budgets',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__budgets',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          cascadeDelete: true,
          collectionId: 'vr4lv9hatzgmgfz',
          hidden: false,
          id: 'relation_budget_category',
          maxSelect: 1,
          minSelect: 0,
          name: 'category',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          hidden: false,
          id: 'number_budget_amount',
          max: null,
          min: 0,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: true,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'bool_budget_rollover_enabled',
          name: 'rollover_enabled',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: 'number_budget_rollover_cap',
          max: null,
          min: 0,
          name: 'rollover_cap',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'json_budget_alert_thresholds',
          maxSize: 2000000,
          name: 'alert_thresholds',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'bool_budget_is_active',
          name: 'is_active',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: 'number3145888567',
          max: null,
          min: null,
          name: 'year',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2394296326',
          max: null,
          min: null,
          name: 'month',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_WOScuAqS9L` ON `wallet__budgets` (\n  `category`,\n  `year`,\n  `month`\n)'
      ],
      system: false
    }
  },
  budgets_aggregated: {
    schema: z.object({
      category: z.string(),
      amount: z.number(),
      year: z.number(),
      month: z.number(),
      rollover_enabled: z.boolean(),
      rollover_cap: z.number(),
      alert_thresholds: z.any(),
      is_active: z.boolean(),
      created: z.string(),
      updated: z.string(),
      spent_amount: z.any(),
      rollover_amount: z.any()
    }),
    raw: {
      id: 'pbc_230479806',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'wallet__budgets_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          cascadeDelete: true,
          collectionId: 'vr4lv9hatzgmgfz',
          hidden: false,
          id: '_clone_Dj49',
          maxSelect: 1,
          minSelect: 0,
          name: 'category',
          presentable: false,
          required: true,
          system: false,
          type: 'relation'
        },
        {
          hidden: false,
          id: '_clone_rw2F',
          max: null,
          min: 0,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: true,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '_clone_H8Yn',
          max: null,
          min: null,
          name: 'year',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '_clone_SNDn',
          max: null,
          min: null,
          name: 'month',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '_clone_xmka',
          name: 'rollover_enabled',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: '_clone_L87d',
          max: null,
          min: 0,
          name: 'rollover_cap',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '_clone_p8T7',
          maxSize: 2000000,
          name: 'alert_thresholds',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: '_clone_PVz3',
          name: 'is_active',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: '_clone_BYRJ',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: '_clone_8osV',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'json3081274703',
          maxSize: 1,
          name: 'spent_amount',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json810917041',
          maxSize: 1,
          name: 'rollover_amount',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        "WITH monthly_spent AS (\n  SELECT\n    wallet__transactions_income_expenses.category,\n    CAST(strftime('%Y', wallet__transactions.date) AS INTEGER) AS year,\n    CAST(strftime('%m', wallet__transactions.date) AS INTEGER) - 1 AS month,\n    SUM(wallet__transactions.amount) AS spent_amount\n  FROM wallet__transactions_income_expenses\n  JOIN wallet__transactions \n    ON wallet__transactions_income_expenses.base_transaction = wallet__transactions.id\n  WHERE wallet__transactions_income_expenses.type = 'expenses'\n  GROUP BY \n    wallet__transactions_income_expenses.category,\n    CAST(strftime('%Y', wallet__transactions.date) AS INTEGER),\n    CAST(strftime('%m', wallet__transactions.date) AS INTEGER) - 1\n),\nprev_month_data AS (\n  SELECT\n    b.id AS budget_id,\n    b.amount - COALESCE(ms.spent_amount, 0) AS prev_unspent,\n    b.amount * COALESCE(b.rollover_cap, 100) / 100.0 AS max_rollover,\n    b.rollover_enabled\n  FROM wallet__budgets b\n  LEFT JOIN monthly_spent ms ON (\n    ms.category = b.category\n    AND (\n      (b.month = 0 AND ms.year = b.year - 1 AND ms.month = 11) OR\n      (b.month > 0 AND ms.year = b.year AND ms.month = b.month - 1)\n    )\n  )\n  WHERE b.is_active = 1\n),\nrollover_calc AS (\n  SELECT\n    budget_id,\n    CASE \n      WHEN rollover_enabled = 1 AND prev_unspent > 0 THEN\n        CASE WHEN prev_unspent < max_rollover THEN prev_unspent ELSE max_rollover END\n      ELSE 0 \n    END AS rollover_amount\n  FROM prev_month_data\n)\n  SELECT\n    b.id,\n    b.category,\n    b.amount,\n    b.year,\n    b.month,\n    b.rollover_enabled,\n    b.rollover_cap,\n    b.alert_thresholds,\n    b.is_active,\n    b.created,\n    b.updated,\n    COALESCE(ms.spent_amount, 0) AS spent_amount,\n    COALESCE(rc.rollover_amount, 0) AS rollover_amount\n  FROM wallet__budgets b\n  LEFT JOIN monthly_spent ms ON (\n    ms.category = b.category \n    AND ms.year = b.year \n    AND ms.month = b.month\n  )\n  LEFT JOIN rollover_calc rc ON rc.budget_id = b.id\n  WHERE b.is_active = 1\n"
    }
  },
  savings_goals: {
    schema: z.object({
      name: z.string(),
      icon: z.string(),
      color: z.string(),
      target_amount: z.number(),
      current_amount: z.number(),
      target_date: z.string().optional(),
      asset: z.string().optional(),
      is_active: z.boolean()
    }),
    raw: {
      id: 'savings_goals_001',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'wallet__savings_goals',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'savings_goal_name',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: true,
          primaryKey: false,
          required: true,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'savings_goal_icon',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'savings_goal_color',
          max: 0,
          min: 0,
          name: 'color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'savings_goal_target_amount',
          max: null,
          min: 0,
          name: 'target_amount',
          onlyInt: false,
          presentable: false,
          required: true,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'savings_goal_current_amount',
          max: null,
          min: 0,
          name: 'current_amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'savings_goal_target_date',
          max: '',
          min: '',
          name: 'target_date',
          presentable: false,
          required: false,
          system: false,
          type: 'date'
        },
        {
          cascadeDelete: false,
          collectionId: 'jb4b93uex7fgql5',
          hidden: false,
          id: 'savings_goal_asset',
          maxSelect: 1,
          minSelect: 0,
          name: 'asset',
          presentable: false,
          required: false,
          system: false,
          type: 'relation'
        },
        {
          hidden: false,
          id: 'savings_goal_is_active',
          name: 'is_active',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: 'savings_goal_created',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'savings_goal_updated',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate'
        }
      ],
      indexes: [],
      system: false
    }
  }
}

export default walletSchemas
