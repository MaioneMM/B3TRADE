// Definição de todas as conquistas disponíveis no B3Trade
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string; // para o badge
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string; // ISO date string
}

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_profit',
    title: 'Primeiro Lucro',
    description: 'Realizou lucro em uma operação pela primeira vez.',
    icon: '🟢',
    color: '#26a69a',
    rarity: 'common',
  },
  {
    id: 'first_loss',
    title: 'Escola do Mercado',
    description: 'Realizou um prejuízo — a melhor lição do mercado.',
    icon: '📉',
    color: '#ef5350',
    rarity: 'common',
  },
  {
    id: 'ten_trades',
    title: 'Operador Ativo',
    description: 'Realizou 10 operações (compras + vendas).',
    icon: '⚡',
    color: '#f59e0b',
    rarity: 'common',
  },
  {
    id: 'big_win',
    title: 'Grande Jogada',
    description: 'Obteve um lucro acima de R$ 5.000 em uma única operação.',
    icon: '💎',
    color: '#3b82f6',
    rarity: 'rare',
  },
  {
    id: 'survivor',
    title: 'Sobrevivente',
    description: 'Resetou a conta e voltou a operar. A resiliência é tudo.',
    icon: '🔄',
    color: '#8b5cf6',
    rarity: 'rare',
  },
  {
    id: 'profit_streak_3',
    title: 'Sequência de Lucros',
    description: 'Realizou 3 operações consecutivas com lucro.',
    icon: '🔥',
    color: '#f97316',
    rarity: 'epic',
  },
  {
    id: 'portfolio_1m',
    title: 'Carteira Robusta',
    description: 'Patrimônio total (saldo + posições) ultrapassou R$ 1.000.000.',
    icon: '💰',
    color: '#eab308',
    rarity: 'epic',
  },
  {
    id: 'top_10_rank',
    title: 'Elite do Mercado',
    description: 'Alcançou o Top 10 do ranking global.',
    icon: '🏆',
    color: '#FFD700',
    rarity: 'legendary',
  },
];
