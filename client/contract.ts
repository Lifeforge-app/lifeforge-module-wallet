export type EndpointTransactionsCreate_InputBody =
  | {
      type: "income" | "expenses";
      amount: number;
      date?: string;
      particulars?: string;
      asset?: string;
      category?: string;
      platform?: string;
      ledgers?: string[];
      location?: {
        name: string;
        formattedAddress: string;
        location: {
          latitude: number;
          longitude: number;
        };
      } | null;
    }
  | {
      type: "transfer";
      amount: number;
      date?: string;
      from: string;
      to: string;
    };
export type EndpointTransactionsCreateMultiple_OutputCREATED = null;
export type EndpointTransactionsGetById_OutputOK =
  | {
      id: string;
      type: "transfer";
      amount: number;
      date: string;
      receipt: string;
      from: string;
      to: string;
    }
  | {
      id: string;
      type: "income";
      amount: number;
      date: string;
      receipt: string;
      particulars: string;
      asset: string;
      category: string;
      platform: string | null;
      ledgers: string[];
      location_name: string;
      location_coords: {
        lon: number;
        lat: number;
      } | null;
      asset_info: {
        name: string;
        icon: string;
      };
      category_info: {
        name: string;
        icon: string;
        color: string;
      };
      platform_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
      ledger_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
    }
  | {
      id: string;
      type: "expenses";
      amount: number;
      date: string;
      receipt: string;
      particulars: string;
      asset: string;
      category: string;
      platform: string | null;
      ledgers: string[];
      location_name: string;
      location_coords: {
        lon: number;
        lat: number;
      } | null;
      asset_info: {
        name: string;
        icon: string;
      };
      category_info: {
        name: string;
        icon: string;
        color: string;
      };
      platform_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
      ledger_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
    };
export type EndpointTransactionsRemove_OutputNO_CONTENT = void;
export type EndpointTransactionsUpdate_InputBody =
  | {
      type: "income" | "expenses";
      amount: number;
      date?: string;
      particulars?: string;
      asset?: string;
      category?: string;
      platform?: string;
      ledgers?: string[];
      location?: {
        name: string;
        formattedAddress: string;
        location: {
          latitude: number;
          longitude: number;
        };
      } | null;
    }
  | {
      type: "transfer";
      amount: number;
      date?: string;
      from: string;
      to: string;
    };
export type EndpointTransactionsFromNaturalLanguage_OutputOK = (
  | {
      date: string;
      amount: number;
      type: "transfer";
      from: string;
      to: string;
    }
  | {
      date: string;
      amount: number;
      category: string;
      particulars: string;
      location_coords: {
        lon: number;
        lat: number;
      };
      location_name: string;
      asset: string;
      platform?: string;
      ledgers?: string[];
      asset_info: {
        name: string;
        icon: string;
      };
      category_info: {
        name: string;
        icon: string;
        color: string;
      };
      platform_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
      ledger_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
      type: "income";
    }
  | {
      date: string;
      amount: number;
      category: string;
      particulars: string;
      location_coords: {
        lon: number;
        lat: number;
      };
      location_name: string;
      asset: string;
      platform?: string;
      ledgers?: string[];
      asset_info: {
        name: string;
        icon: string;
      };
      category_info: {
        name: string;
        icon: string;
        color: string;
      };
      platform_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
      ledger_info: {
        name: string;
        icon: string;
        color: string;
      } | null;
      type: "expenses";
    }
)[];
export type EndpointTransactionsPromptsAutoGenerate_OutputOK = string;
export type EndpointCategoriesList_OutputOK = {
  id: string;
  type: "income" | "expenses";
  name: string;
  icon: string;
  color: string;
  amount: number;
}[];
export type EndpointCategoriesRemove_OutputNO_CONTENT = void;
export type EndpointAssetsList_OutputOK = {
  id: string;
  name: string;
  icon: string;
  starting_balance: number;
  is_liability: boolean;
  is_inactive: boolean;
  credit_limit: number;
  transaction_count: number;
  current_balance: number;
}[];
export type EndpointAssetsRemove_OutputNO_CONTENT = void;
export type EndpointLedgersList_OutputOK = {
  id: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
}[];
export type EndpointLedgersRemove_OutputNO_CONTENT = void;
export type EndpointPlatformsList_OutputOK = {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
}[];
export type EndpointPlatformsRemove_OutputNO_CONTENT = void;
export type EndpointTemplatesRemove_OutputNO_CONTENT = void;
export type EndpointAnalyticsGetChartData_OutputOK = {
  date: string;
  income: number;
  expenses: number;
}[];
export type EndpointAnalyticsGetDailyBreakdown_OutputOK = {
  date: string;
  income: number;
  expenses: number;
}[];
export type EndpointAnalyticsGetSpendingByLocation_OutputOK = {
  lat: number;
  lng: number;
  locationName: string;
  amount: number;
  count: number;
}[];
export type EndpointAnalyticsGetSpendingByPlatform_OutputOK = {
  platform: string;
  amount: number;
  count: number;
  percentage: number;
}[];

export interface Contract {
  transactions: {
    create: EndpointTransactionsCreate;
    createMultiple: EndpointTransactionsCreateMultiple;
    getById: EndpointTransactionsGetById;
    list: EndpointTransactionsList;
    remove: EndpointTransactionsRemove;
    scanReceipt: EndpointTransactionsScanReceipt;
    update: EndpointTransactionsUpdate;
    fromNaturalLanguage: EndpointTransactionsFromNaturalLanguage;
    prompts: {
      autoGenerate: EndpointTransactionsPromptsAutoGenerate;
      get: EndpointTransactionsPromptsGet;
      update: EndpointTransactionsPromptsUpdate;
    };
  };
  categories: {
    create: EndpointCategoriesCreate;
    list: EndpointCategoriesList;
    remove: EndpointCategoriesRemove;
    update: EndpointCategoriesUpdate;
  };
  assets: {
    create: EndpointAssetsCreate;
    getAssetAccumulatedBalance: EndpointAssetsGetAssetAccumulatedBalance;
    list: EndpointAssetsList;
    remove: EndpointAssetsRemove;
    update: EndpointAssetsUpdate;
  };
  ledgers: {
    create: EndpointLedgersCreate;
    list: EndpointLedgersList;
    remove: EndpointLedgersRemove;
    update: EndpointLedgersUpdate;
  };
  platforms: {
    create: EndpointPlatformsCreate;
    list: EndpointPlatformsList;
    remove: EndpointPlatformsRemove;
    update: EndpointPlatformsUpdate;
  };
  templates: {
    create: EndpointTemplatesCreate;
    list: EndpointTemplatesList;
    remove: EndpointTemplatesRemove;
    update: EndpointTemplatesUpdate;
  };
  statements: {
    get: EndpointStatementsGet;
  };
  analytics: {
    getAvailableYearMonths: EndpointAnalyticsGetAvailableYearMonths;
    getCategoriesBreakdown: EndpointAnalyticsGetCategoriesBreakdown;
    getChartData: EndpointAnalyticsGetChartData;
    getDailyBreakdown: EndpointAnalyticsGetDailyBreakdown;
    getEntityBreakdown: EndpointAnalyticsGetEntityBreakdown;
    getIncomeExpensesSummary: EndpointAnalyticsGetIncomeExpensesSummary;
    getSpendingByLocation: EndpointAnalyticsGetSpendingByLocation;
    getSpendingByPlatform: EndpointAnalyticsGetSpendingByPlatform;
    getTransactionCountByDay: EndpointAnalyticsGetTransactionCountByDay;
    getTypesCount: EndpointAnalyticsGetTypesCount;
  };
}
export interface EndpointTransactionsCreate {
  method: "post";
  input: {
    body?: EndpointTransactionsCreate_InputBody;
  };
  output: {
    CREATED: EndpointTransactionsCreate_OutputCREATED;
  };
  media: {receipt: {optional: true}};
}
export interface EndpointTransactionsCreate_OutputCREATED {
  id: string;
  type: "transfer" | "income_expenses";
  amount: number;
  date: string;
  receipt: string;
}
export interface EndpointTransactionsCreateMultiple {
  method: "post";
  input: {
    body?: EndpointTransactionsCreateMultiple_InputBody;
  };
  output: {
    CREATED: EndpointTransactionsCreateMultiple_OutputCREATED;
  };
  media: null;
}
export interface EndpointTransactionsCreateMultiple_InputBody {
  transactions: (
    | {
        type: "income" | "expenses";
        amount: number;
        date?: string;
        particulars?: string;
        asset?: string;
        category?: string;
        platform?: string;
        ledgers?: string[];
        location?: {
          name: string;
          formattedAddress: string;
          location: {
            latitude: number;
            longitude: number;
          };
        } | null;
      }
    | {
        type: "transfer";
        amount: number;
        date?: string;
        from: string;
        to: string;
      }
  )[];
}
export interface EndpointTransactionsGetById {
  method: "get";
  input: {
    query?: EndpointTransactionsGetById_InputQuery;
  };
  output: {
    OK: EndpointTransactionsGetById_OutputOK;
  };
  media: null;
}
export interface EndpointTransactionsGetById_InputQuery {
  id: string;
}
export interface EndpointTransactionsList {
  method: "get";
  input: {
    query?: EndpointTransactionsList_InputQuery;
  };
  output: {
    OK: EndpointTransactionsList_OutputOK;
  };
  media: null;
}
export interface EndpointTransactionsList_InputQuery {
  q?: string;
  type?: "income" | "expenses" | "transfer";
  category?: string;
  platform?: string;
  asset?: string;
  ledger?: string;
  inactiveAssets?: "true" | "false";
  startDate?: string;
  endDate?: string;
  range?: "week" | "month" | "mtd" | "quarter" | "year" | "ytd" | "all" | "custom";
  page?: string;
  perPage?: string;
}
export interface EndpointTransactionsList_OutputOK {
  groups: {
    date: string;
    items: (
      | {
          id: string;
          type: "transfer";
          amount: number;
          date: string;
          receipt: string;
          from: string;
          to: string;
        }
      | {
          id: string;
          type: "income";
          amount: number;
          date: string;
          receipt: string;
          particulars: string;
          asset: string;
          category: string;
          platform: string | null;
          ledgers: string[];
          location_name: string;
          location_coords: {
            lon: number;
            lat: number;
          } | null;
          asset_info: {
            name: string;
            icon: string;
          };
          category_info: {
            name: string;
            icon: string;
            color: string;
          };
          platform_info: {
            name: string;
            icon: string;
            color: string;
          } | null;
          ledger_info: {
            name: string;
            icon: string;
            color: string;
          } | null;
        }
      | {
          id: string;
          type: "expenses";
          amount: number;
          date: string;
          receipt: string;
          particulars: string;
          asset: string;
          category: string;
          platform: string | null;
          ledgers: string[];
          location_name: string;
          location_coords: {
            lon: number;
            lat: number;
          } | null;
          asset_info: {
            name: string;
            icon: string;
          };
          category_info: {
            name: string;
            icon: string;
            color: string;
          };
          platform_info: {
            name: string;
            icon: string;
            color: string;
          } | null;
          ledger_info: {
            name: string;
            icon: string;
            color: string;
          } | null;
        }
    )[];
  }[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}
export interface EndpointTransactionsRemove {
  method: "post";
  input: {
    query?: EndpointTransactionsRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointTransactionsRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointTransactionsRemove_InputQuery {
  id: string;
}
export interface EndpointTransactionsScanReceipt {
  method: "post";
  input: {};
  output: {
    OK: EndpointTransactionsScanReceipt_OutputOK;
  };
  media: {file: {optional: false}};
}
export interface EndpointTransactionsScanReceipt_OutputOK {
  date: string;
  amount: number;
  type: "income" | "expenses";
  category: string;
  platform: string | null;
  particulars: string;
  location_coords: {
    lon: number;
    lat: number;
  };
  location_name: string;
  matchedTransactionIds: string[];
}
export interface EndpointTransactionsUpdate {
  method: "post";
  input: {
    query?: EndpointTransactionsUpdate_InputQuery;
    body?: EndpointTransactionsUpdate_InputBody;
  };
  output: {
    OK: EndpointTransactionsUpdate_OutputOK;
  };
  media: {receipt: {optional: true}};
}
export interface EndpointTransactionsUpdate_InputQuery {
  id: string;
}
export interface EndpointTransactionsUpdate_OutputOK {
  id: string;
  type: "transfer" | "income_expenses";
  amount: number;
  date: string;
  receipt: string;
}
export interface EndpointTransactionsFromNaturalLanguage {
  method: "post";
  input: {
    body?: EndpointTransactionsFromNaturalLanguage_InputBody;
  };
  output: {
    OK: EndpointTransactionsFromNaturalLanguage_OutputOK;
  };
  media: null;
}
export interface EndpointTransactionsFromNaturalLanguage_InputBody {
  description: string;
}
export interface EndpointTransactionsPromptsAutoGenerate {
  method: "post";
  input: {
    body?: EndpointTransactionsPromptsAutoGenerate_InputBody;
  };
  output: {
    OK: EndpointTransactionsPromptsAutoGenerate_OutputOK;
  };
  media: null;
}
export interface EndpointTransactionsPromptsAutoGenerate_InputBody {
  type: "income" | "expenses";
  count: number;
}
export interface EndpointTransactionsPromptsGet {
  method: "get";
  input: {};
  output: {
    OK: EndpointTransactionsPromptsGet_OutputOK;
  };
  media: null;
}
export interface EndpointTransactionsPromptsGet_OutputOK {
  income: string;
  expenses: string;
}
export interface EndpointTransactionsPromptsUpdate {
  method: "post";
  input: {
    body?: EndpointTransactionsPromptsUpdate_InputBody;
  };
  output: {
    OK: EndpointTransactionsPromptsUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointTransactionsPromptsUpdate_InputBody {
  income: string;
  expenses: string;
}
export interface EndpointTransactionsPromptsUpdate_OutputOK {
  income: string;
  expenses: string;
}
export interface EndpointCategoriesCreate {
  method: "post";
  input: {
    body?: EndpointCategoriesCreate_InputBody;
  };
  output: {
    CREATED: EndpointCategoriesCreate_OutputCREATED;
  };
  media: null;
}
export interface EndpointCategoriesCreate_InputBody {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expenses";
}
export interface EndpointCategoriesCreate_OutputCREATED {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expenses";
}
export interface EndpointCategoriesList {
  method: "get";
  input: {};
  output: {
    OK: EndpointCategoriesList_OutputOK;
  };
  media: null;
}
export interface EndpointCategoriesRemove {
  method: "post";
  input: {
    query?: EndpointCategoriesRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointCategoriesRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointCategoriesRemove_InputQuery {
  id: string;
}
export interface EndpointCategoriesUpdate {
  method: "post";
  input: {
    query?: EndpointCategoriesUpdate_InputQuery;
    body?: EndpointCategoriesUpdate_InputBody;
  };
  output: {
    OK: EndpointCategoriesUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointCategoriesUpdate_InputQuery {
  id: string;
}
export interface EndpointCategoriesUpdate_InputBody {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expenses";
}
export interface EndpointCategoriesUpdate_OutputOK {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expenses";
}
export interface EndpointAssetsCreate {
  method: "post";
  input: {
    body?: EndpointAssetsCreate_InputBody;
  };
  output: {
    CREATED: EndpointAssetsCreate_OutputCREATED;
  };
  media: null;
}
export interface EndpointAssetsCreate_InputBody {
  name: string;
  icon: string;
  starting_balance: number;
  is_liability: boolean;
  is_inactive: boolean;
  credit_limit: number;
}
export interface EndpointAssetsCreate_OutputCREATED {
  id: string;
  name: string;
  icon: string;
  starting_balance: number;
  is_liability: boolean;
  is_inactive: boolean;
  credit_limit: number;
}
export interface EndpointAssetsGetAssetAccumulatedBalance {
  method: "get";
  input: {
    query?: EndpointAssetsGetAssetAccumulatedBalance_InputQuery;
  };
  output: {
    OK: EndpointAssetsGetAssetAccumulatedBalance_OutputOK;
  };
  media: null;
}
export interface EndpointAssetsGetAssetAccumulatedBalance_InputQuery {
  id: string;
  rangeMode: "week" | "month" | "year" | "all" | "custom" | "quarter";
  startDate?: string;
  endDate?: string;
}
export interface EndpointAssetsGetAssetAccumulatedBalance_OutputOK {
  balances: {
    [k: string]: number;
  };
  startBalance: number;
  endBalance: number;
}
export interface EndpointAssetsList {
  method: "get";
  input: {};
  output: {
    OK: EndpointAssetsList_OutputOK;
  };
  media: null;
}
export interface EndpointAssetsRemove {
  method: "post";
  input: {
    query?: EndpointAssetsRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointAssetsRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointAssetsRemove_InputQuery {
  id: string;
}
export interface EndpointAssetsUpdate {
  method: "post";
  input: {
    query?: EndpointAssetsUpdate_InputQuery;
    body?: EndpointAssetsUpdate_InputBody;
  };
  output: {
    OK: EndpointAssetsUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointAssetsUpdate_InputQuery {
  id: string;
}
export interface EndpointAssetsUpdate_InputBody {
  name: string;
  icon: string;
  starting_balance: number;
  is_liability: boolean;
  is_inactive: boolean;
  credit_limit: number;
}
export interface EndpointAssetsUpdate_OutputOK {
  id: string;
  name: string;
  icon: string;
  starting_balance: number;
  is_liability: boolean;
  is_inactive: boolean;
  credit_limit: number;
}
export interface EndpointLedgersCreate {
  method: "post";
  input: {
    body?: EndpointLedgersCreate_InputBody;
  };
  output: {
    CREATED: EndpointLedgersCreate_OutputCREATED;
  };
  media: null;
}
export interface EndpointLedgersCreate_InputBody {
  name: string;
  icon: string;
  color: string;
}
export interface EndpointLedgersCreate_OutputCREATED {
  id: string;
  name: string;
  icon: string;
  color: string;
}
export interface EndpointLedgersList {
  method: "get";
  input: {};
  output: {
    OK: EndpointLedgersList_OutputOK;
  };
  media: null;
}
export interface EndpointLedgersRemove {
  method: "post";
  input: {
    query?: EndpointLedgersRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointLedgersRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointLedgersRemove_InputQuery {
  id: string;
}
export interface EndpointLedgersUpdate {
  method: "post";
  input: {
    query?: EndpointLedgersUpdate_InputQuery;
    body?: EndpointLedgersUpdate_InputBody;
  };
  output: {
    OK: EndpointLedgersUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointLedgersUpdate_InputQuery {
  id: string;
}
export interface EndpointLedgersUpdate_InputBody {
  name: string;
  icon: string;
  color: string;
}
export interface EndpointLedgersUpdate_OutputOK {
  id: string;
  name: string;
  icon: string;
  color: string;
}
export interface EndpointPlatformsCreate {
  method: "post";
  input: {
    body?: EndpointPlatformsCreate_InputBody;
  };
  output: {
    CREATED: EndpointPlatformsCreate_OutputCREATED;
  };
  media: null;
}
export interface EndpointPlatformsCreate_InputBody {
  name: string;
  icon: string;
  color: string;
}
export interface EndpointPlatformsCreate_OutputCREATED {
  id: string;
  name: string;
  icon: string;
  color: string;
}
export interface EndpointPlatformsList {
  method: "get";
  input: {};
  output: {
    OK: EndpointPlatformsList_OutputOK;
  };
  media: null;
}
export interface EndpointPlatformsRemove {
  method: "post";
  input: {
    query?: EndpointPlatformsRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointPlatformsRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointPlatformsRemove_InputQuery {
  id: string;
}
export interface EndpointPlatformsUpdate {
  method: "post";
  input: {
    query?: EndpointPlatformsUpdate_InputQuery;
    body?: EndpointPlatformsUpdate_InputBody;
  };
  output: {
    OK: EndpointPlatformsUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointPlatformsUpdate_InputQuery {
  id: string;
}
export interface EndpointPlatformsUpdate_InputBody {
  name: string;
  icon: string;
  color: string;
}
export interface EndpointPlatformsUpdate_OutputOK {
  id: string;
  name: string;
  icon: string;
  color: string;
}
export interface EndpointTemplatesCreate {
  method: "post";
  input: {
    body?: EndpointTemplatesCreate_InputBody;
  };
  output: {
    CREATED: EndpointTemplatesCreate_OutputCREATED;
  };
  media: null;
}
export interface EndpointTemplatesCreate_InputBody {
  name: string;
  type: "income" | "expenses";
  amount: number;
  particulars: string;
  asset?: string;
  category?: string;
  platform?: string;
  ledgers?: string[];
  location?: {
    name: string;
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
}
export interface EndpointTemplatesCreate_OutputCREATED {
  id: string;
  name: string;
  type: "income" | "expenses";
  amount: number;
  particulars: string;
  asset: string | null;
  category: string | null;
  platform: string | null;
  ledgers: string[];
  location_name: string;
  location_coords: {
    lon: number;
    lat: number;
  } | null;
}
export interface EndpointTemplatesList {
  method: "get";
  input: {};
  output: {
    OK: EndpointTemplatesList_OutputOK;
  };
  media: null;
}
export interface EndpointTemplatesList_OutputOK {
  income: {
    id: string;
    name: string;
    type: "income" | "expenses";
    amount: number;
    particulars: string;
    asset: string | null;
    category: string | null;
    platform: string | null;
    ledgers: string[];
    location_name: string;
    location_coords: {
      lon: number;
      lat: number;
    } | null;
  }[];
  expenses: {
    id: string;
    name: string;
    type: "income" | "expenses";
    amount: number;
    particulars: string;
    asset: string | null;
    category: string | null;
    platform: string | null;
    ledgers: string[];
    location_name: string;
    location_coords: {
      lon: number;
      lat: number;
    } | null;
  }[];
}
export interface EndpointTemplatesRemove {
  method: "post";
  input: {
    query?: EndpointTemplatesRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointTemplatesRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointTemplatesRemove_InputQuery {
  id: string;
}
export interface EndpointTemplatesUpdate {
  method: "post";
  input: {
    query?: EndpointTemplatesUpdate_InputQuery;
    body?: EndpointTemplatesUpdate_InputBody;
  };
  output: {
    OK: EndpointTemplatesUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointTemplatesUpdate_InputQuery {
  id: string;
}
export interface EndpointTemplatesUpdate_InputBody {
  name: string;
  type: "income" | "expenses";
  amount: number;
  particulars: string;
  asset?: string;
  category?: string;
  platform?: string;
  ledgers?: string[];
  location?: {
    name: string;
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
}
export interface EndpointTemplatesUpdate_OutputOK {
  id: string;
  name: string;
  type: "income" | "expenses";
  amount: number;
  particulars: string;
  asset: string | null;
  category: string | null;
  platform: string | null;
  ledgers: string[];
  location_name: string;
  location_coords: {
    lon: number;
    lat: number;
  } | null;
}
export interface EndpointStatementsGet {
  method: "get";
  input: {
    query?: EndpointStatementsGet_InputQuery;
  };
  output: {
    OK: EndpointStatementsGet_OutputOK;
  };
  media: null;
}
export interface EndpointStatementsGet_InputQuery {
  year: string;
  month: string;
}
export interface EndpointStatementsGet_OutputOK {
  overview: {
    monthlyIncome: number;
    monthlyExpenses: number;
    netIncome: number;
  };
  assets: {
    balances: {
      [k: string]: {
        last: number;
        current: number;
        change: number;
        percentage: number;
      };
    };
    total: {
      last: number;
      current: number;
      change: number;
      percentage: number;
    };
    liabilitiesTotal: {
      last: number;
      current: number;
      change: number;
      percentage: number;
    };
    netWorth: {
      last: number;
      current: number;
      change: number;
      percentage: number;
    };
  };
  categoryComparison: {
    income: {
      currentTotal: number;
      previousTotal: number;
      totalChange: number;
      totalPercentageChange: number;
      items: {
        [k: string]: {
          currentAmount: number;
          previousAmount: number;
          change: number;
          percentageChange: number;
        };
      };
    };
    expenses: {
      currentTotal: number;
      previousTotal: number;
      totalChange: number;
      totalPercentageChange: number;
      items: {
        [k: string]: {
          currentAmount: number;
          previousAmount: number;
          change: number;
          percentageChange: number;
        };
      };
    };
  };
  transactions: {
    income: {
      items: (
        | {
            id: string;
            type: "transfer";
            amount: number;
            date: string;
            receipt: string;
            from: string;
            to: string;
          }
        | {
            id: string;
            type: "income";
            amount: number;
            date: string;
            receipt: string;
            particulars: string;
            asset: string;
            category: string;
            platform: string | null;
            ledgers: string[];
            location_name: string;
            location_coords: {
              lon: number;
              lat: number;
            } | null;
            asset_info: {
              name: string;
              icon: string;
            };
            category_info: {
              name: string;
              icon: string;
              color: string;
            };
            platform_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
            ledger_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
          }
        | {
            id: string;
            type: "expenses";
            amount: number;
            date: string;
            receipt: string;
            particulars: string;
            asset: string;
            category: string;
            platform: string | null;
            ledgers: string[];
            location_name: string;
            location_coords: {
              lon: number;
              lat: number;
            } | null;
            asset_info: {
              name: string;
              icon: string;
            };
            category_info: {
              name: string;
              icon: string;
              color: string;
            };
            platform_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
            ledger_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
          }
      )[];
      total: number;
      count: number;
    };
    expenses: {
      items: (
        | {
            id: string;
            type: "transfer";
            amount: number;
            date: string;
            receipt: string;
            from: string;
            to: string;
          }
        | {
            id: string;
            type: "income";
            amount: number;
            date: string;
            receipt: string;
            particulars: string;
            asset: string;
            category: string;
            platform: string | null;
            ledgers: string[];
            location_name: string;
            location_coords: {
              lon: number;
              lat: number;
            } | null;
            asset_info: {
              name: string;
              icon: string;
            };
            category_info: {
              name: string;
              icon: string;
              color: string;
            };
            platform_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
            ledger_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
          }
        | {
            id: string;
            type: "expenses";
            amount: number;
            date: string;
            receipt: string;
            particulars: string;
            asset: string;
            category: string;
            platform: string | null;
            ledgers: string[];
            location_name: string;
            location_coords: {
              lon: number;
              lat: number;
            } | null;
            asset_info: {
              name: string;
              icon: string;
            };
            category_info: {
              name: string;
              icon: string;
              color: string;
            };
            platform_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
            ledger_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
          }
      )[];
      total: number;
      count: number;
    };
    transfer: {
      items: (
        | {
            id: string;
            type: "transfer";
            amount: number;
            date: string;
            receipt: string;
            from: string;
            to: string;
          }
        | {
            id: string;
            type: "income";
            amount: number;
            date: string;
            receipt: string;
            particulars: string;
            asset: string;
            category: string;
            platform: string | null;
            ledgers: string[];
            location_name: string;
            location_coords: {
              lon: number;
              lat: number;
            } | null;
            asset_info: {
              name: string;
              icon: string;
            };
            category_info: {
              name: string;
              icon: string;
              color: string;
            };
            platform_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
            ledger_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
          }
        | {
            id: string;
            type: "expenses";
            amount: number;
            date: string;
            receipt: string;
            particulars: string;
            asset: string;
            category: string;
            platform: string | null;
            ledgers: string[];
            location_name: string;
            location_coords: {
              lon: number;
              lat: number;
            } | null;
            asset_info: {
              name: string;
              icon: string;
            };
            category_info: {
              name: string;
              icon: string;
              color: string;
            };
            platform_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
            ledger_info: {
              name: string;
              icon: string;
              color: string;
            } | null;
          }
      )[];
      total: number;
      count: number;
    };
    totalCount: number;
  };
  platformBreakdown: {
    platform: string | null;
    amount: number;
    count: number;
    percentage: number;
  }[];
}
export interface EndpointAnalyticsGetAvailableYearMonths {
  method: "get";
  input: {};
  output: {
    OK: EndpointAnalyticsGetAvailableYearMonths_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetAvailableYearMonths_OutputOK {
  years: number[];
  monthsByYear: {
    [k: string]: number[];
  };
}
export interface EndpointAnalyticsGetCategoriesBreakdown {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetCategoriesBreakdown_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetCategoriesBreakdown_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetCategoriesBreakdown_InputQuery {
  year?: string;
  month?: string;
  range?: "week" | "month" | "mtd" | "quarter" | "year" | "ytd" | "all" | "custom";
  startDate?: string;
  endDate?: string;
  groupBy?: "categories" | "assets" | "platforms" | "ledgers";
}
export interface EndpointAnalyticsGetCategoriesBreakdown_OutputOK {
  income: {
    [k: string]: {
      amount: number;
      count: number;
      percentage: number;
    };
  };
  expenses: {
    [k: string]: {
      amount: number;
      count: number;
      percentage: number;
    };
  };
}
export interface EndpointAnalyticsGetChartData {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetChartData_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetChartData_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetChartData_InputQuery {
  range: "week" | "month" | "mtd" | "quarter" | "year" | "ytd" | "all" | "custom";
  startDate?: string;
  endDate?: string;
}
export interface EndpointAnalyticsGetDailyBreakdown {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetDailyBreakdown_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetDailyBreakdown_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetDailyBreakdown_InputQuery {
  range?: "week" | "month" | "mtd" | "quarter" | "year" | "ytd" | "all" | "custom";
  startDate?: string;
  endDate?: string;
}
export interface EndpointAnalyticsGetEntityBreakdown {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetEntityBreakdown_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetEntityBreakdown_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetEntityBreakdown_InputQuery {
  range?: "week" | "month" | "mtd" | "quarter" | "year" | "ytd" | "all" | "custom";
  startDate?: string;
  endDate?: string;
}
export interface EndpointAnalyticsGetEntityBreakdown_OutputOK {
  categories: {
    [k: string]: {
      income: number;
      expenses: number;
      count: number;
    };
  };
  platforms: {
    [k: string]: {
      income: number;
      expenses: number;
      count: number;
    };
  };
  ledgers: {
    [k: string]: {
      income: number;
      expenses: number;
      count: number;
    };
  };
}
export interface EndpointAnalyticsGetIncomeExpensesSummary {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetIncomeExpensesSummary_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetIncomeExpensesSummary_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetIncomeExpensesSummary_InputQuery {
  year: string;
  month: string;
}
export interface EndpointAnalyticsGetIncomeExpensesSummary_OutputOK {
  totalIncome: number;
  totalExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}
export interface EndpointAnalyticsGetSpendingByLocation {
  method: "get";
  input: {};
  output: {
    OK: EndpointAnalyticsGetSpendingByLocation_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetSpendingByPlatform {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetSpendingByPlatform_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetSpendingByPlatform_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetSpendingByPlatform_InputQuery {
  year?: string;
  month?: string;
  range?: "week" | "month" | "mtd" | "quarter" | "year" | "ytd" | "all" | "custom";
  startDate?: string;
  endDate?: string;
}
export interface EndpointAnalyticsGetTransactionCountByDay {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetTransactionCountByDay_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetTransactionCountByDay_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetTransactionCountByDay_InputQuery {
  year: string;
  month: string;
  viewFilter?: string;
}
export interface EndpointAnalyticsGetTransactionCountByDay_OutputOK {
  [k: string]: {
    income: number;
    expenses: number;
    transfer: number;
    incomeAmount: number;
    expensesAmount: number;
    transferAmount: number;
    total: number;
    count: number;
  };
}
export interface EndpointAnalyticsGetTypesCount {
  method: "get";
  input: {
    query?: EndpointAnalyticsGetTypesCount_InputQuery;
  };
  output: {
    OK: EndpointAnalyticsGetTypesCount_OutputOK;
  };
  media: null;
}
export interface EndpointAnalyticsGetTypesCount_InputQuery {
  year?: string;
  month?: string;
  range?: "week" | "month" | "mtd" | "quarter" | "year" | "ytd" | "all" | "custom";
  startDate?: string;
  endDate?: string;
}
export interface EndpointAnalyticsGetTypesCount_OutputOK {
  [k: string]: {
    transactionCount: number;
    accumulatedAmount: number;
    previousCount: number;
    previousAmount: number;
    percentageChange: number;
  };
}
