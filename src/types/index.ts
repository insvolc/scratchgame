export interface Lottery {
  id: string
  name: string
  price: number
  maxPrize: number
  probability: string
  theme: string
  type: LotteryType
  playType: PlayType
  description: string
}

export type LotteryType = 'number' | 'symbol' | 'grid' | 'lucky' | 'mixed'

export type PlayType = 'match3' | 'numberMatch' | 'symbolMatch' | 'lineMatch' | 'bonus'

export interface CellData {
  value: string
  prize?: number
  isWinning: boolean
  isRevealed: boolean
}

export interface SymbolCell {
  symbol: string
  isWinning: boolean
  isRevealed: boolean
}

export interface BackpackItem {
  id: string
  lotteryId: string
  lotteryName: string
  lotteryTheme: string
  purchaseTime: number
  isScratched: boolean
  prize?: number
  result?: LotteryResult
  // 好运十倍 - 数字匹配（符合现实玩法：5个中奖号码，10个我的号码）
  myNumbers?: CellData[]
  winningNumber?: string
  winningNumbers?: Array<{ value: string; isRevealed: boolean }>
  // 点石成金 - 找符号
  symbolAreas?: Array<{ symbols: SymbolCell[]; prize: number }>
  // 走进桃花源 - 九宫格连线
  grid?: Array<Array<{ symbol: string; isWinning: boolean; isRevealed: boolean; lineIndex: number }>>
  winningLines?: number[]
  // 甜蜜蜜 - 三同号
  numberAreas?: Array<{ numbers: CellData[]; prize: number }>
  // 超级财富 - 复合玩法
  numberArea?: { myNumbers: CellData[]; winningNumber: string }
  symbolArea?: { symbols: SymbolCell[] }
  bonusPrizes?: Array<{ value: number; isWinning: boolean; isRevealed: boolean }>
}

export type LotteryResult = 'grand' | 'first' | 'second' | 'third' | 'fourth' | 'none'

export interface PrizeConfig {
  result: LotteryResult
  prize: number
  probability: number
}

export interface GameState {
  coins: number
  lotteries: Lottery[]
  backpack: BackpackItem[]
  currentView: 'home' | 'shop' | 'backpack' | 'scratch'
  currentLottery: BackpackItem | null
}