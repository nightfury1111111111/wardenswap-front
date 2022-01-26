import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'WardenSwap',
  description:
    'The most popular AMM on BSC by user count! Earn CAKE through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by WardenSwap), NFTs, and more, on a platform you can trust.',
  image: 'https://pancakeswap.finance/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${t('WardenSwap')}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${t('WardenSwap')}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${t('WardenSwap')}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${t('WardenSwap')}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${t('WardenSwap')}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${t('WardenSwap')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('WardenSwap')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('WardenSwap')}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${t('WardenSwap')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('WardenSwap')}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${t('WardenSwap')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('WardenSwap')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('WardenSwap')}`,
      }
    case '/collectibles':
      return {
        title: `${t('Collectibles')} | ${t('WardenSwap')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('WardenSwap')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('WardenSwap')}`,
      }
    case '/profile':
      return {
        title: `${t('Your Profile')} | ${t('WardenSwap')}`,
      }
    case '/profile/tasks':
      return {
        title: `${t('Task Center')} | ${t('WardenSwap')}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${t('WardenSwap')}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${t('WardenSwap')}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${t('WardenSwap')}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('WardenSwap Info & Analytics')}`,
        description: 'View statistics for Pancakeswap exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('WardenSwap Info & Analytics')}`,
        description: 'View statistics for Pancakeswap exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Pools')} | ${t('WardenSwap Info & Analytics')}`,
        description: 'View statistics for Pancakeswap exchanges.',
      }
    default:
      return null
  }
}
