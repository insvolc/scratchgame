import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Lottery, BackpackItem, LotteryResult, GameState, Achievement, AchievementDefinition, GameStats } from '@/types'

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

const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'first_purchase',
    name: '初试身手',
    description: '第一次购买彩票',
    icon: '🎫',
    check: stats => stats.totalPurchased >= 1
  },
  {
    id: 'first_win',
    name: '开门红',
    description: '第一次中奖',
    icon: '🎉',
    check: stats => stats.totalWins >= 1
  },
  {
    id: 'win_streak_10',
    name: '中奖达人',
    description: '累计中奖 10 次',
    icon: '🔥',
    check: stats => stats.totalWins >= 10
  },
  {
    id: 'big_win',
    name: '大奖猎手',
    description: '单次中奖金额达到 500 金币',
    icon: '💎',
    check: stats => stats.maxSingleWin >= 500
  },
  {
    id: 'grand_master',
    name: '至尊锦鲤',
    description: '中过一次特等奖',
    icon: '👑',
    check: stats => stats.grandPrizeCount >= 1
  },
  {
    id: 'veteran_50',
    name: '刮奖老手',
    description: '累计刮开 50 张彩票',
    icon: '🏆',
    check: stats => stats.totalScratched >= 50
  },
  {
    id: 'wealth_king',
    name: '财富王者',
    description: '金币数量达到 10000',
    icon: '💰',
    check: stats => stats.peakCoins >= 10000
  }
]

function createDefaultAchievements(): Achievement[] {
  return achievementDefinitions.map(def => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    unlocked: false
  }))
}

function generateLotteryContent(lottery: Lottery): Record<string, unknown> {
  switch (lottery.playType) {
    case 'numberMatch':
      return generateNumberMatchContent()
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
      const parsed = JSON.parse(data) as Partial<GameState>
      if (!parsed.achievements || parsed.achievements.length !== achievementDefinitions.length) {
        parsed.achievements = createDefaultAchievements()
      }
      if (!parsed.achievementNotifications) {
        parsed.achievementNotifications = []
      }
      return parsed
    }
  } catch {
    console.error('Failed to load game data')
  }
  return {
    achievements: createDefaultAchievements(),
    achievementNotifications: []
  }
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
  const currentView = ref<'home' | 'shop' | 'backpack' | 'scratch' | 'achievements'>(saved.currentView ?? 'home')
  const currentLottery = ref<BackpackItem | null>(saved.currentLottery ?? null)
  const achievements = ref<Achievement[]>(saved.achievements ?? createDefaultAchievements())
  const achievementNotifications = ref<Achievement[]>(saved.achievementNotifications ?? [])
  const peakCoins = ref(saved.peakCoins ?? coins.value)
  const transitionDirection = ref<'forward' | 'backward'>('forward')

  const unscratchedCount = computed(() =>
    backpack.value.filter(item => !item.isScratched).length
  )

  const totalWon = computed(() =>
    backpack.value.filter(item => item.isScratched && item.prize).reduce((sum, item) => sum + (item.prize || 0), 0)
  )

  function setView(view: 'home' | 'shop' | 'backpack' | 'scratch' | 'achievements') {
    const prevView = currentView.value
    if (view === 'home' || (prevView === 'scratch' && view === 'backpack')) {
      transitionDirection.value = 'backward'
    } else {
      transitionDirection.value = 'forward'
    }
    currentView.value = view
    saveState()
  }

  function computeStats(): GameStats {
    const scratched = backpack.value.filter(item => item.isScratched)
    const wins = scratched.filter(item => (item.prize || 0) > 0)
    const totalEarned = wins.reduce((sum, item) => sum + (item.prize || 0), 0)
    const maxSingleWin = wins.reduce((max, item) => Math.max(max, item.prize || 0), 0)

    return {
      totalScratched: scratched.length,
      totalWins: wins.length,
      totalEarned,
      maxSingleWin,
      grandPrizeCount: wins.filter(item => item.result === 'grand').length,
      firstPrizeCount: wins.filter(item => item.result === 'first').length,
      peakCoins: peakCoins.value,
      totalPurchased: backpack.value.length
    }
  }

  function checkAchievements() {
    const stats = computeStats()
    const newlyUnlocked: Achievement[] = []

    for (const def of achievementDefinitions) {
      const existing = achievements.value.find(a => a.id === def.id)
      if (!existing || existing.unlocked) continue

      if (def.check(stats)) {
        existing.unlocked = true
        existing.unlockedAt = Date.now()
        newlyUnlocked.push({ ...existing })
      }
    }

    if (newlyUnlocked.length > 0) {
      achievementNotifications.value.push(...newlyUnlocked)
      saveState()
    }
  }

  function clearAchievementNotifications() {
    achievementNotifications.value = []
    saveState()
  }

  checkAchievements()

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

    checkAchievements()
    saveState()
    return true
  }
  
  function selectLottery(item: BackpackItem) {
    currentLottery.value = item
    transitionDirection.value = 'forward'
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

    checkAchievements()
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
    peakCoins.value = 100
    backpack.value = []
    achievements.value = createDefaultAchievements()
    achievementNotifications.value = []
    saveState()
  }
  
  function addCoins(amount: number) {
    coins.value += amount
    if (coins.value > peakCoins.value) {
      peakCoins.value = coins.value
    }
    checkAchievements()
    saveState()
  }
  
  function saveState() {
    saveToStorage({
      coins: coins.value,
      backpack: backpack.value,
      currentView: currentView.value,
      currentLottery: currentLottery.value,
      achievements: achievements.value,
      achievementNotifications: achievementNotifications.value,
      peakCoins: peakCoins.value
    })
  }
  
  return {
    coins,
    lotteries,
    backpack,
    currentView,
    currentLottery,
    achievements,
    achievementNotifications,
    peakCoins,
    transitionDirection,
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
    addCoins,
    clearAchievementNotifications,
    achievementDefinitions
  }
})