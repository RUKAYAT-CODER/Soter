import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  OnchainModule,
  ONCHAIN_ADAPTER_TOKEN,
  createOnchainAdapter,
} from './onchain.module';
import { OnchainAdapter } from './onchain.adapter';
import { MockOnchainAdapter } from './onchain.adapter.mock';
import { SorobanOnchainAdapter } from './soroban-onchain.adapter';
import * as StellarSdk from '@stellar/stellar-sdk';

describe('OnchainModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Generate a valid keypair for testing
    const keypair = StellarSdk.Keypair.random();
    
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: false,
          ignoreEnvFile: true,
        }),
        OnchainModule,
      ],
      providers: [
        {
          provide: ONCHAIN_ADAPTER_TOKEN,
          useClass: MockOnchainAdapter,
        },
      ],
    })
    .overrideProvider(ConfigService)
    .useValue({
      get: jest.fn((key: string) => {
        const config = {
          'ONCHAIN_ADAPTER': 'mock',
          'SOROBAN_CONTRACT_ID': 'CDLZFC3SYJYDZT7K67VY75FOVPJT4KPNGW22L5XWYUI5ZHQMWUCJY2Q',
          'STELLAR_SECRET_KEY': keypair.secret(),
          'STELLAR_RPC_URL': 'https://soroban-testnet.stellar.org',
          'STELLAR_NETWORK': 'testnet',
        };
        return config[key];
      }),
    })
    .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide OnchainAdapter token', () => {
    const adapter = module.get<OnchainAdapter>(ONCHAIN_ADAPTER_TOKEN);
    expect(adapter).toBeDefined();
  });

  it('should provide MockOnchainAdapter by default', () => {
    const adapter = module.get<OnchainAdapter>(ONCHAIN_ADAPTER_TOKEN);
    expect(adapter).toBeInstanceOf(MockOnchainAdapter);
  });
});

describe('createOnchainAdapter', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
  });

  it('should create MockOnchainAdapter when ONCHAIN_ADAPTER is mock', () => {
    jest.spyOn(configService, 'get').mockReturnValue('mock');

    const adapter = createOnchainAdapter(configService);

    expect(adapter).toBeInstanceOf(MockOnchainAdapter);
  });

  it('should create MockOnchainAdapter when ONCHAIN_ADAPTER is not set', () => {
    jest.spyOn(configService, 'get').mockReturnValue(undefined);

    const adapter = createOnchainAdapter(configService);

    expect(adapter).toBeInstanceOf(MockOnchainAdapter);
  });

  it('should create MockOnchainAdapter when ONCHAIN_ADAPTER is Mock (case insensitive)', () => {
    jest.spyOn(configService, 'get').mockReturnValue('Mock');

    const adapter = createOnchainAdapter(configService);

    expect(adapter).toBeInstanceOf(MockOnchainAdapter);
  });

  it('should create SorobanOnchainAdapter when ONCHAIN_ADAPTER is soroban', () => {
    // Generate a valid keypair for testing
    const keypair = StellarSdk.Keypair.random();

    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'ONCHAIN_ADAPTER') return 'soroban';
      if (key === 'SOROBAN_CONTRACT_ID')
        return 'CDLZFC3SYJYDZT7K67VY75FOVPJT4KPNGW22L5XWYUI5ZHQMWUCJY2Q';
      if (key === 'STELLAR_SECRET_KEY') return keypair.secret();
      if (key === 'STELLAR_RPC_URL')
        return 'https://soroban-testnet.stellar.org';
      if (key === 'STELLAR_NETWORK') return 'testnet';
      return undefined;
    });

    const adapter = createOnchainAdapter(configService);

    expect(adapter).toBeInstanceOf(SorobanOnchainAdapter);
  });

  it('should throw error when ONCHAIN_ADAPTER is unknown', () => {
    jest.spyOn(configService, 'get').mockReturnValue('unknown');

    expect(() => createOnchainAdapter(configService)).toThrow(
      'Unknown ONCHAIN_ADAPTER: unknown. Supported values: mock, soroban',
    );
  });
});
