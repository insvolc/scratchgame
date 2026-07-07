export type LotteryResult = 'grand' | 'first' | 'second' | 'third' | 'fourth' | 'none'

export interface Lottery {
  id: string
  name: string
  price: number
  maxPrize: number
  probability: string
  theme: string
  type: string
  playType: 'numberMatch' | 'lineMatch' | 'match3' | 'bonus' | 'xiXiangFeng' | 'luckyDouble'
  description: string
}

export interface BackpackItem {
  id: string
  lotteryId: string
  lotteryName: string
  lotteryTheme: string
  purchaseTime: number
  isScratched: boolean
  prize: number
  result: LotteryResult
  myNumbers?: Array<{ value: string; prize: number; isWinning: boolean; isRevealed: boolean }>
  winningNumbers?: Array<{ value: string; isRevealed: boolean }>
  grid?: Array<Array<{ symbol: string; isWinning: boolean; isRevealed: boolean; lineIndex: number }>>
  winningLines?: number[]
  numberAreas?: Array<{ numbers: Array<{ value: string; isWinning: boolean; isRevealed: boolean }>; prize: number }>
  numberArea?: {
    myNumbers: Array<{ value: string; prize: number; isWinning: boolean; isRevealed: boolean }>
    winningNumbers: Array<{ value: string; isRevealed: boolean }>
  }
  symbolArea?: { symbols: Array<{ symbol: string; isWinning: boolean; isRevealed: boolean }> }
  bonusPrizes?: Array<{ value: number; isWinning: boolean; isRevealed: boolean }>
  xiXiangFengCells?: Array<Array<{ symbol: string; basePrize: number; multiplier: number; isWinning: boolean; isRevealed: boolean }>>
  claimedXiCells?: string[]
  luckyDoubleRounds?: Array<{
    roundIndex: number
    symbols: Array<{ symbol: string; isWinning: boolean; isRevealed: boolean }>
    prize: number
    multiplier: number
    isWinning: boolean
  }>
  claimedLuckyDoubleRounds?: number[]
  claimedPrize?: number
}

export interface GameState {
  coins: number
  lotteries?: Lottery[]
  backpack: BackpackItem[]
  currentView: 'home' | 'shop' | 'backpack' | 'scratch'
  currentLottery: BackpackItem | null
}
