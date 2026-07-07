import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Lottery, BackpackItem, LotteryResult, GameState } from '@/types'

const STORAGE_KEY = 'scratch_game_data'

// 真实刮刮乐玩法设计
const lotteries: Lottery[] = [
  {
    id: '1',
    name: '点石成金',
    price: 50,
    maxPrize: 100,
    probability: '1:3.3',
    theme: 'gold',
    type: 'number',
    playType: 'numberMatch',
    description: '刮开"我的号码"区，对照"中奖号码"，出现相同号码即中该号码下方所示奖金'
  },
  {
    id: '3',
    name: '走进桃花源',
    price: 50,
    maxPrize: 1000,
    probability: '1:5',
    theme: 'red',
    type: 'grid',
    playType: 'lineMatch',
    description: '在任一游戏区内，刮出3个相同的图案即中该游戏区的奖金；任意一条连线上的图案完全相同，即中该条连线所示的奖金'
  },
  {
    id: '4',
    name: '甜蜜蜜',
    price: 5,
    maxPrize: 50,
    probability: '1:4',
    theme: 'green',
    type: 'lucky',
    playType: 'match3',
    description: '刮开覆盖层，如果任何一个"游戏区"内出现3个相同的图符，即中该游戏区的奖金'
  },
  {
    id: '5',
    name: '超级财富',
    price: 100,
    maxPrize: 10000,
    probability: '1:3',
    theme: 'rainbow',
    type: 'mixed',
    playType: 'bonus',
    description: '三大玩法，一票三次中奖机会！数字匹配+找幸运符+奖金即开，三重惊喜等你来'
  },
  {
    id: '6',
    name: '喜相逢',
    price: 20,
    maxPrize: 500,
    probability: '1:1.7',
    theme: 'red-gold',
    type: 'xi',
    playType: 'xiXiangFeng',
    description: '刮开覆盖层，出现“喜”字图符可获得对应奖金，出现“囍”字图符可获得对应奖金的两倍，25次机会兼中兼得'
  },
  {
    id: '7',
    name: '幸运加倍',
    price: 20,
    maxPrize: 10000,
    probability: '1:2.9',
    theme: 'red-lucky',
    type: 'lucky',
    playType: 'luckyDouble',
    description: '刮开覆盖膜，在同一局游戏中刮出3个相同图符即可获得该局奖金；刮出“¥”图符即可获得该局奖金的两倍，10次机会兼中兼得'
  }
]

const prizeConfigs: Record<string, { result: LotteryResult; prize: number; probability: number }[]> = {
  '1': [
    { result: 'grand', prize: 100, probability: 0.005 },
    { result: 'first', prize: 50, probability: 0.025 },
    { result: 'second', prize: 20, probability: 0.075 },
    { result: 'third', prize: 10, probability: 0.1975 },
    { result: 'none', prize: 0, probability: 0.6975 }
  ],
  '3': [
    { result: 'grand', prize: 1000, probability: 0.002 },
    { result: 'first', prize: 500, probability: 0.015 },
    { result: 'second', prize: 100, probability: 0.05 },
    { result: 'third', prize: 50, probability: 0.10 },
    { result: 'none', prize: 0, probability: 0.823 }
  ],
  '4': [
    { result: 'first', prize: 50, probability: 0.03 },
    { result: 'second', prize: 20, probability: 0.07 },
    { result: 'third', prize: 10, probability: 0.15 },
    { result: 'fourth', prize: 5, probability: 0.25 },
    { result: 'none', prize: 0, probability: 0.50 }
  ],
  '5': [
    { result: 'grand', prize: 10000, probability: 0.0005 },
    { result: 'first', prize: 1000, probability: 0.008 },
    { result: 'second', prize: 500, probability: 0.03 },
    { result: 'third', prize: 100, probability: 0.08 },
    { result: 'fourth', prize: 50, probability: 0.12 },
    { result: 'none', prize: 0, probability: 0.7615 }
  ],
  '6': [
    { result: 'grand', prize: 500, probability: 0.005 },
    { result: 'first', prize: 100, probability: 0.025 },
    { result: 'second', prize: 50, probability: 0.12 },
    { result: 'third', prize: 20, probability: 0.45 },
    { result: 'none', prize: 0, probability: 0.40 }
  ],
  '7': [
    { result: 'grand', prize: 10000, probability: 0.002 },
    { result: 'first', prize: 1000, probability: 0.015 },
    { result: 'second', prize: 500, probability: 0.03 },
    { result: 'third', prize: 100, probability: 0.10 },
    { result: 'fourth', prize: 20, probability: 0.20 },
    { result: 'none', prize: 0, probability: 0.653 }
  ]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 点石成金 - 数字匹配型（符合现实玩法）
// 规则：中奖号码区（5个号码）和我的号码区（20个号码，每个带奖金）都被覆盖
// 刮开后，若我的号码与任一中奖号码相同，即获得该号码下方的奖金
function generateNumberMatchContent(): { 
  myNumbers: Array<{ value: string; prize: number; isWinning: boolean; isRevealed: boolean }>;
  winningNumbers: Array<{ value: string; isRevealed: boolean }>
} {
  const allNumbers: string[] = []
  for (let i = 1; i <= 36; i++) {
    allNumbers.push(i.toString().padStart(2, '0'))
  }
  
  // 根据 prizeConfigs 确定本次目标奖金
  const { prize: targetPrize } = determinePrize('1')
  
  // 选择 5 个中奖号码
  const availableForWinning = [...allNumbers]
  const winningValues: string[] = []
  
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * availableForWinning.length)
    winningValues.push(availableForWinning.splice(idx, 1)[0])
  }
  
  // 生成 20 个我的号码
  const basePrizes = [5, 10, 20, 50, 100, 200, 500, 1000, 20, 50, 5, 10, 20, 50, 100, 200, 500, 1000, 20, 50]
  const myNumbers: Array<{ value: string; prize: number; isWinning: boolean; isRevealed: boolean }> = []
  
  // 从我的号码池中排除所有中奖号码，避免意外中奖
  let availableForMyNumbers = [...allNumbers].filter(n => !winningValues.includes(n))
  
  if (targetPrize > 0) {
    // 中奖：选择第一个中奖号码承载目标奖金
    const winningValue = winningValues[0]
    myNumbers.push({
      value: winningValue,
      prize: targetPrize,
      isWinning: true,
      isRevealed: false
    })
  }
  
  // 填充剩余我的号码
  const remainingCount = 20 - myNumbers.length
  for (let i = 0; i < remainingCount; i++) {
    const idx = Math.floor(Math.random() * availableForMyNumbers.length)
    const value = availableForMyNumbers.splice(idx, 1)[0]
    
    myNumbers.push({
      value,
      prize: basePrizes[i] * 10,
      isWinning: false,
      isRevealed: false
    })
  }
  
  return {
    myNumbers: myNumbers.sort(() => Math.random() - 0.5),
    winningNumbers: winningValues
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(value => ({ value, isRevealed: false }))
  }
}

// 走进桃花源 - 九宫格连线型
function generateGridLineContent(): {
  grid: Array<Array<{ symbol: string; isWinning: boolean; isRevealed: boolean; lineIndex: number }>>;
  winningLines: number[]
} {
  const symbols = ['🌸', '🍑', '🌺', '🌻', '🌷']
  const lines = [0, 1, 2, 3, 4, 5, 6, 7]
  
  const winningLines: number[] = []
  const gridSymbols: Array<{ symbol: string; isWinning: boolean; lineIndex: number; isRevealed: boolean }> = []
  
  const hasWinLine = Math.random() > 0.4
  
  if (hasWinLine) {
    const lineIdx = Math.floor(Math.random() * lines.length)
    winningLines.push(lineIdx)
    const winSymbol = symbols[Math.floor(Math.random() * symbols.length)]
    
    for (let i = 0; i < 9; i++) {
      const isOnWinningLine = (
        (lineIdx === 0 && i >= 0 && i <= 2) ||
        (lineIdx === 1 && i >= 3 && i <= 5) ||
        (lineIdx === 2 && i >= 6 && i <= 8) ||
        (lineIdx === 3 && i % 3 === 0) ||
        (lineIdx === 4 && i % 3 === 1) ||
        (lineIdx === 5 && i % 3 === 2) ||
        (lineIdx === 6 && i % 4 === 0) ||
        (lineIdx === 7 && (i === 2 || i === 4 || i === 6))
      )
      
      if (isOnWinningLine) {
        gridSymbols.push({ symbol: winSymbol, isWinning: true, lineIndex: lineIdx, isRevealed: false })
      } else {
        gridSymbols.push({ 
          symbol: symbols[Math.floor(Math.random() * symbols.length)], 
          isWinning: false, 
          lineIndex: -1,
          isRevealed: false 
        })
      }
    }
  } else {
    for (let i = 0; i < 9; i++) {
      gridSymbols.push({ 
        symbol: symbols[Math.floor(Math.random() * symbols.length)], 
        isWinning: false, 
        lineIndex: -1,
        isRevealed: false 
      })
    }
  }
  
  const grid: typeof gridSymbols[] = []
  for (let r = 0; r < 3; r++) {
    grid.push(gridSymbols.slice(r * 3, r * 3 + 3))
  }
  
  return { grid, winningLines }
}

// 甜蜜蜜 - 三同号型
function generateMatch3Content(): {
  areas: Array<{
    numbers: Array<{ value: string; isWinning: boolean; isRevealed: boolean }>;
    prize: number
  }>
} {
  const areas = []
  const areaPrizes = [50, 20, 10]
  
  for (let a = 0; a < 3; a++) {
    const numbers: Array<{ value: string; isWinning: boolean; isRevealed: boolean }> = []
    const isWinning = Math.random() > 0.5
    const winningNum = Math.floor(Math.random() * 9) + 1
    
    if (isWinning) {
      for (let i = 0; i < 3; i++) {
        numbers.push({ value: winningNum.toString(), isWinning: true, isRevealed: false })
      }
    } else {
      const usedNums = new Set<number>()
      for (let i = 0; i < 3; i++) {
        let num: number
        do {
          num = Math.floor(Math.random() * 9) + 1
        } while (usedNums.has(num))
        usedNums.add(num)
        numbers.push({ value: num.toString(), isWinning: false, isRevealed: false })
      }
    }
    
    areas.push({ numbers: numbers.sort(() => Math.random() - 0.5), prize: areaPrizes[a] })
  }
  
  return { areas }
}

// 超级财富 - 复合玩法
function generateMixedContent(): {
  numberArea: { myNumbers: Array<{ value: string; prize: number; isWinning: boolean; isRevealed: boolean }>; winningNumbers: Array<{ value: string; isRevealed: boolean }> };
  symbolArea: { symbols: Array<{ symbol: string; isWinning: boolean; isRevealed: boolean }> };
  bonusPrizes: Array<{ value: number; isWinning: boolean; isRevealed: boolean }>
} {
  const numberArea = generateNumberMatchContent()
  
  const symbolArea = { symbols: [] as Array<{ symbol: string; isWinning: boolean; isRevealed: boolean }> }
  const isWinning = Math.random() > 0.5
  if (isWinning) {
    for (let i = 0; i < 3; i++) {
      symbolArea.symbols.push({ symbol: '💎', isWinning: true, isRevealed: false })
    }
    const distractionSymbol = ['👑', '⭐', '💰'][Math.floor(Math.random() * 3)]
    symbolArea.symbols.push({ symbol: distractionSymbol, isWinning: false, isRevealed: false })
  } else {
    for (let i = 0; i < 4; i++) {
      symbolArea.symbols.push({ 
        symbol: ['👑', '⭐', '💰', '🎁'][Math.floor(Math.random() * 4)], 
        isWinning: false, 
        isRevealed: false 
      })
    }
  }
  symbolArea.symbols = symbolArea.symbols.sort(() => Math.random() - 0.5)
  
  const bonusPrizes = [10, 20, 50, 100, 200, 500].map(v => ({
    value: v,
    isWinning: v === 500 && Math.random() > 0.7,
    isRevealed: false
  }))
  
  return { numberArea, symbolArea, bonusPrizes }
}

// 喜相逢 - 5×5 图符型（符合现实 20 元福彩玩法）
// 规则：25 个圆形图符下方覆盖奖金；刮出“喜”得对应奖金，刮出“囍”得两倍奖金，兼中兼得
function generateXiXiangFengContent(): {
  xiXiangFengCells: Array<Array<{ symbol: string; basePrize: number; multiplier: number; isWinning: boolean; isRevealed: boolean }>>
} {
  const { prize: targetPrize } = determinePrize('6')
  const rows = 5
  const cols = 5
  const cells: Array<Array<{ symbol: string; basePrize: number; multiplier: number; isWinning: boolean; isRevealed: boolean }>> = []
  
  // 填充非中奖的候选图案（参考现实喜相逢的祥云、花卉、瑞雪、星光等传统纹样，使用黑色线条风格，仅用于展示，不中奖）
  const fillerPrizes = [5, 10, 20, 50, 100, 200, 500, 1000]
  const nonWinSymbols = ['☁', '✿', '❀', '✾', '✽', '❋', '✣', '✤', '❉', '❅', '❈', '❇']
  
  for (let r = 0; r < rows; r++) {
    const row: Array<{ symbol: string; basePrize: number; multiplier: number; isWinning: boolean; isRevealed: boolean }> = []
    for (let c = 0; c < cols; c++) {
      row.push({
        symbol: nonWinSymbols[Math.floor(Math.random() * nonWinSymbols.length)],
        basePrize: fillerPrizes[Math.floor(Math.random() * fillerPrizes.length)],
        multiplier: 1,
        isWinning: false,
        isRevealed: false
      })
    }
    cells.push(row)
  }
  
  if (targetPrize > 0) {
    // 按目标奖金拆分中奖点，体现“兼中兼得”
    const winPlans: Array<{ basePrize: number; multiplier: number }> = []
    
    if (targetPrize >= 500) {
      // 特等奖：一个囍（250×2）
      winPlans.push({ basePrize: 250, multiplier: 2 })
    } else if (targetPrize >= 100) {
      // 一等奖：一个囍（50×2）
      winPlans.push({ basePrize: 50, multiplier: 2 })
    } else if (targetPrize >= 50) {
      // 二等奖：一个喜 50
      winPlans.push({ basePrize: 50, multiplier: 1 })
    } else if (targetPrize >= 20) {
      // 三等奖：一个喜 20
      winPlans.push({ basePrize: 20, multiplier: 1 })
    }
    
    // 随机放置中奖单元格
    const positions: Array<{ r: number; c: number }> = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions.push({ r, c })
      }
    }
    positions.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < winPlans.length && i < positions.length; i++) {
      const { r, c } = positions[i]
      const plan = winPlans[i]
      cells[r][c] = {
        symbol: plan.multiplier === 2 ? '囍' : '喜',
        basePrize: plan.basePrize,
        multiplier: plan.multiplier,
        isWinning: true,
        isRevealed: false
      }
    }
  }
  
  return { xiXiangFengCells: cells }
}

// 幸运加倍 - 10 局图符匹配型（参考现实 10 元福彩玩法）
// 规则：每局 3 个图符；3 个相同图符即可赢得该局右侧奖金；出现 “¥” 图符则该局奖金翻倍；10 局兼中兼得
function generateLuckyDoubleContent(): {
  luckyDoubleRounds: Array<{
    roundIndex: number
    symbols: Array<{ symbol: string; isWinning: boolean; isRevealed: boolean }>
    prize: number
    multiplier: number
    isWinning: boolean
  }>
} {
  const { prize: targetPrize } = determinePrize('7')
  // 10 局对应的右侧奖金（按真实票面顺序，将 100 万缩放为 10000 金币）
  const roundPrizes = [20, 40, 50, 80, 100, 200, 500, 1000, 5000, 10000]
  const allSymbols = ['💰', '☁', '🍀', '🎁', '🏯', '🪭', '🧨', '🍑', '🪙', '🍊', '🍎', '🏮', '🎀', '💎', '🪁', '🍶', '🌸', '🎋', '🪷', '🪕', '🧧', '🎒', '🎈', '🎰', '🍭', '✨', '🍌', '☯️']
  const doubleSymbol = '¥'

  const rounds: Array<{
    roundIndex: number
    symbols: Array<{ symbol: string; isWinning: boolean; isRevealed: boolean }>
    prize: number
    multiplier: number
    isWinning: boolean
  }> = []

  for (let i = 0; i < 10; i++) {
    const [s1, s2, s3] = pickThreeDistinctSymbols(allSymbols)
    rounds.push({
      roundIndex: i + 1,
      symbols: [
        { symbol: s1, isWinning: false, isRevealed: false },
        { symbol: s2, isWinning: false, isRevealed: false },
        { symbol: s3, isWinning: false, isRevealed: false }
      ],
      prize: roundPrizes[i],
      multiplier: 1,
      isWinning: false
    })
  }

  if (targetPrize > 0) {
    // 将目标奖金拆分为若干局的组合（优先使用高奖金局，允许翻倍）
    const winPlans = buildLuckyDoubleWinPlans(targetPrize, roundPrizes)

    for (const plan of winPlans) {
      const round = rounds[plan.idx]
      round.multiplier = plan.multiplier
      round.isWinning = true

      if (plan.multiplier === 2) {
        // 出现 “¥” 图符即翻倍：放置一个 ¥，其余两个为不同普通图符
        const [s1, s2] = pickTwoDistinctSymbols(allSymbols)
        round.symbols = shuffleArray([
          { symbol: doubleSymbol, isWinning: true, isRevealed: false },
          { symbol: s1, isWinning: true, isRevealed: false },
          { symbol: s2, isWinning: true, isRevealed: false }
        ])
      } else {
        // 三同号中奖：3 个相同普通图符
        const symbol = allSymbols[Math.floor(Math.random() * allSymbols.length)]
        round.symbols = [
          { symbol, isWinning: true, isRevealed: false },
          { symbol, isWinning: true, isRevealed: false },
          { symbol, isWinning: true, isRevealed: false }
        ]
      }
    }
  }

  return { luckyDoubleRounds: rounds }
}

function pickThreeDistinctSymbols(symbols: string[]): [string, string, string] {
  const pool = [...symbols]
  const result: string[] = []
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result as [string, string, string]
}

function pickTwoDistinctSymbols(symbols: string[]): [string, string] {
  const pool = [...symbols]
  const idx1 = Math.floor(Math.random() * pool.length)
  const s1 = pool.splice(idx1, 1)[0]
  const idx2 = Math.floor(Math.random() * pool.length)
  const s2 = pool.splice(idx2, 1)[0]
  return [s1, s2]
}

function shuffleArray<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5)
}

// 将目标奖金拆分为若干局的 { multiplier }，优先保证精确匹配并适当展示 ¥ 翻倍
function buildLuckyDoubleWinPlans(targetPrize: number, roundPrizes: number[]): Array<{ multiplier: 1 | 2; idx: number }> {
  // 预定义各目标奖金的精确拆分方案，确保 “¥” 翻倍特征能够出现
  const combos: Record<number, Array<{ prize: number; multiplier: 1 | 2 }>> = {
    10000: [{ prize: 5000, multiplier: 2 }],
    1000: [{ prize: 500, multiplier: 2 }],
    500: [{ prize: 500, multiplier: 1 }],
    100: [{ prize: 40, multiplier: 2 }, { prize: 20, multiplier: 1 }],
    20: [{ prize: 20, multiplier: 1 }]
  }

  const combo = combos[targetPrize]
  if (!combo) return []

  const plans: Array<{ multiplier: 1 | 2; idx: number }> = []
  const used = new Set<number>()

  for (const { prize, multiplier } of combo) {
    const candidates = roundPrizes
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => p === prize && !used.has(i))
    if (candidates.length === 0) return []

    const idx = candidates[Math.floor(Math.random() * candidates.length)].i
    plans.push({ multiplier, idx })
    used.add(idx)
  }

  return plans
}

function determinePrize(lotteryId: string): { result: LotteryResult; prize: number } {
  const config = prizeConfigs[lotteryId] || prizeConfigs['1']
  const random = Math.random()
  let cumulative = 0
  
  for (const item of config) {
    cumulative += item.probability
    if (random <= cumulative) {
      return { result: item.result, prize: item.prize }
    }
  }
  
  return { result: 'none', prize: 0 }
}

function generateLotteryContent(lottery: Lottery): Record<string, unknown> {
  switch (lottery.playType) {
    case 'numberMatch':
      return generateNumberMatchContent()
    case 'lineMatch':
      return generateGridLineContent()
    case 'match3':
      return generateMatch3Content()
    case 'bonus':
      return generateMixedContent()
    case 'xiXiangFeng':
      return generateXiXiangFengContent()
    case 'luckyDouble':
      return generateLuckyDoubleContent()
    default:
      return generateNumberMatchContent()
  }
}

function loadFromStorage(): Partial<GameState> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {
    console.error('Failed to load game data')
  }
  return {}
}

function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    console.error('Failed to save game data')
  }
}

export const useGameStore = defineStore('game', () => {
  const saved = loadFromStorage()
  
  const coins = ref(saved.coins ?? 100)
  const backpack = ref<BackpackItem[]>(saved.backpack ?? [])
  const currentView = ref<'home' | 'shop' | 'backpack' | 'scratch'>(saved.currentView ?? 'home')
  const currentLottery = ref<BackpackItem | null>(saved.currentLottery ?? null)
  
  const unscratchedCount = computed(() => 
    backpack.value.filter(item => !item.isScratched).length
  )
  
  const totalWon = computed(() => 
    backpack.value.filter(item => item.isScratched && item.prize).reduce((sum, item) => sum + (item.prize || 0), 0)
  )
  
  function setView(view: 'home' | 'shop' | 'backpack' | 'scratch') {
    currentView.value = view
    saveState()
  }
  
  function calculatePrizeFromContent(lotteryId: string, content: Record<string, unknown>): { result: LotteryResult; prize: number } {
    if (lotteryId === '1' && content.myNumbers) {
      const myNumbers = content.myNumbers as Array<{ value: string; prize: number; isWinning: boolean }>
      const winningNumbers = (content.winningNumbers as Array<{ value: string }> | undefined)?.map(n => n.value) || []
      const totalPrize = myNumbers
        .filter(n => winningNumbers.includes(n.value))
        .reduce((sum, n) => sum + (n.prize || 0), 0)

      let result: LotteryResult = 'none'
      if (totalPrize >= 1000) result = 'grand'
      else if (totalPrize >= 500) result = 'first'
      else if (totalPrize >= 100) result = 'second'
      else if (totalPrize >= 50) result = 'third'
      else if (totalPrize > 0) result = 'fourth'

      return { result, prize: totalPrize }
    }

    if (lotteryId === '6' && content.xiXiangFengCells) {
      const cells = content.xiXiangFengCells as Array<Array<{ basePrize: number; multiplier: number; isWinning: boolean }>>
      const totalPrize = cells.flat().reduce((sum, cell) => {
        return cell.isWinning ? sum + cell.basePrize * cell.multiplier : sum
      }, 0)

      let result: LotteryResult = 'none'
      if (totalPrize >= 500) result = 'grand'
      else if (totalPrize >= 100) result = 'first'
      else if (totalPrize >= 50) result = 'second'
      else if (totalPrize >= 20) result = 'third'
      else if (totalPrize > 0) result = 'fourth'

      return { result, prize: totalPrize }
    }

    if (lotteryId === '7' && content.luckyDoubleRounds) {
      const rounds = content.luckyDoubleRounds as Array<{ prize: number; multiplier: number; isWinning: boolean }>
      const totalPrize = rounds.reduce((sum, round) => {
        return round.isWinning ? sum + round.prize * round.multiplier : sum
      }, 0)

      let result: LotteryResult = 'none'
      if (totalPrize >= 5000) result = 'grand'
      else if (totalPrize >= 1000) result = 'first'
      else if (totalPrize >= 500) result = 'second'
      else if (totalPrize >= 100) result = 'third'
      else if (totalPrize > 0) result = 'fourth'

      return { result, prize: totalPrize }
    }

    return determinePrize(lotteryId)
  }
  
  function buyLottery(lotteryId: string) {
    const lottery = lotteries.find(l => l.id === lotteryId)
    if (!lottery) return false
    
    if (coins.value < lottery.price) return false
    
    coins.value -= lottery.price
    
    const content = generateLotteryContent(lottery)
    const { result, prize } = calculatePrizeFromContent(lotteryId, content)
    
    backpack.value.push({
      id: generateId(),
      lotteryId,
      lotteryName: lottery.name,
      lotteryTheme: lottery.theme,
      purchaseTime: Date.now(),
      isScratched: false,
      prize,
      result,
      ...(lottery.playType === 'xiXiangFeng' ? { claimedXiCells: [], claimedPrize: 0 } : {}),
      ...(lottery.playType === 'luckyDouble' ? { claimedLuckyDoubleRounds: [], claimedPrize: 0 } : {}),
      ...content
    } as BackpackItem)

    saveState()
    return true
  }
  
  function selectLottery(item: BackpackItem) {
    currentLottery.value = item
    currentView.value = 'scratch'
    saveState()
  }
  
  function revealCell(itemId: string, areaIndex: number, cellIndex: number, type: string) {
    const item = backpack.value.find(i => i.id === itemId)
    if (!item || item.isScratched) return
    
    switch (type) {
      case 'numberMatch':
        if (item.myNumbers) {
          item.myNumbers[cellIndex] = { ...item.myNumbers[cellIndex], isRevealed: true }
        }
        break
      case 'match3':
        if (item.numberAreas) {
          item.numberAreas[areaIndex]?.numbers[cellIndex] && 
          (item.numberAreas[areaIndex].numbers[cellIndex].isRevealed = true)
        }
        break
      case 'bonus':
        if (item.bonusPrizes) {
          item.bonusPrizes[cellIndex] && (item.bonusPrizes[cellIndex].isRevealed = true)
        }
        break
      case 'xiXiangFeng':
        if (item.xiXiangFengCells) {
          const row = item.xiXiangFengCells[areaIndex]
          if (row && row[cellIndex]) {
            row[cellIndex] = { ...row[cellIndex], isRevealed: true }
          }
        }
        break
      case 'luckyDouble':
        if (item.luckyDoubleRounds) {
          const round = item.luckyDoubleRounds[areaIndex]
          if (round && round.symbols[cellIndex]) {
            round.symbols[cellIndex] = { ...round.symbols[cellIndex], isRevealed: true }
          }
        }
        break
    }

    checkAutoReveal(item)
    saveState()
  }
  
  function scratchLottery(itemId: string) {
    const item = backpack.value.find(i => i.id === itemId)
    if (!item || item.isScratched) return
    
    item.isScratched = true
    
    if (item.myNumbers) {
      item.myNumbers = item.myNumbers.map(n => ({ ...n, isRevealed: true }))
    }
    
    if (item.winningNumbers) {
      item.winningNumbers = item.winningNumbers.map(n => ({ ...n, isRevealed: true }))
    }
    
    if (item.grid) {
      item.grid = item.grid.map(row => 
        row.map(cell => ({ ...cell, isRevealed: true }))
      )
    }
    
    if (item.numberAreas) {
      item.numberAreas = item.numberAreas.map(area => ({
        ...area,
        numbers: area.numbers.map(n => ({ ...n, isRevealed: true }))
      }))
    }
    
    if (item.numberArea?.myNumbers) {
      item.numberArea.myNumbers = item.numberArea.myNumbers.map(n => ({ ...n, isRevealed: true }))
    }
    if (item.symbolArea?.symbols) {
      item.symbolArea.symbols = item.symbolArea.symbols.map(s => ({ ...s, isRevealed: true }))
    }
    if (item.bonusPrizes) {
      item.bonusPrizes = item.bonusPrizes.map(b => ({ ...b, isRevealed: true }))
    }

    if (item.xiXiangFengCells) {
      item.xiXiangFengCells = item.xiXiangFengCells.map(row =>
        row.map(cell => ({ ...cell, isRevealed: true }))
      )
    }

    if (item.luckyDoubleRounds) {
      item.luckyDoubleRounds = item.luckyDoubleRounds.map(round => ({
        ...round,
        symbols: round.symbols.map(s => ({ ...s, isRevealed: true }))
      }))
    }

    saveState()
  }
  
  function checkAutoReveal(item: BackpackItem) {
    if (!item.isScratched) {
      let totalCells = 0
      let revealedCells = 0
      
      if (item.myNumbers) {
        totalCells += item.myNumbers.length
        revealedCells += item.myNumbers.filter(n => n.isRevealed).length
      }
      
      if (item.grid) {
        item.grid.forEach(row => {
          row.forEach(cell => {
            totalCells++
            if (cell.isRevealed) revealedCells++
          })
        })
      }
      
      if (item.numberAreas) {
        item.numberAreas.forEach(area => {
          totalCells += area.numbers.length
          revealedCells += area.numbers.filter(n => n.isRevealed).length
        })
      }
      
      if (item.numberArea?.myNumbers) {
        totalCells += item.numberArea.myNumbers.length
        revealedCells += item.numberArea.myNumbers.filter(n => n.isRevealed).length
      }
      if (item.symbolArea?.symbols) {
        totalCells += item.symbolArea.symbols.length
        revealedCells += item.symbolArea.symbols.filter(s => s.isRevealed).length
      }
      if (item.bonusPrizes) {
        totalCells += item.bonusPrizes.length
        revealedCells += item.bonusPrizes.filter(b => b.isRevealed).length
      }
      if (item.xiXiangFengCells) {
        item.xiXiangFengCells.forEach(row => {
          totalCells += row.length
          revealedCells += row.filter(cell => cell.isRevealed).length
        })
      }

      if (item.luckyDoubleRounds) {
        item.luckyDoubleRounds.forEach(round => {
          totalCells += round.symbols.length
          revealedCells += round.symbols.filter(s => s.isRevealed).length
        })
      }

      if (totalCells > 0 && revealedCells / totalCells >= 0.6) {
        scratchLottery(item.id)
      }
    }
  }
  
  function removeLottery(itemId: string) {
    const index = backpack.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      backpack.value.splice(index, 1)
      saveState()
    }
  }
  
  function clearScratched() {
    for (let i = backpack.value.length - 1; i >= 0; i--) {
      if (backpack.value[i].isScratched) {
        backpack.value.splice(i, 1)
      }
    }
    if (currentLottery.value?.isScratched) {
      currentLottery.value = null
    }
    saveState()
  }
  
  function refreshCoins() {
    coins.value = 100
    backpack.value = []
    saveState()
  }
  
  function addCoins(amount: number) {
    coins.value += amount
    saveState()
  }
  
  function saveState() {
    saveToStorage({
      coins: coins.value,
      backpack: backpack.value,
      currentView: currentView.value,
      currentLottery: currentLottery.value
    })
  }
  
  return {
    coins,
    lotteries,
    backpack,
    currentView,
    currentLottery,
    unscratchedCount,
    totalWon,
    setView,
    buyLottery,
    selectLottery,
    scratchLottery,
    revealCell,
    removeLottery,
    clearScratched,
    refreshCoins,
    addCoins
  }
})