import type { Settings } from './generated-types'
import type { BrowserDestinationDefinition } from '../../lib/browser-destinations'
import { browserDestination } from '../../runtime/shim'
import { RipeSDK } from './types'

import group from './group'
import identify from './identify'
import track from './track'

import { defaultValues } from '@segment/actions-core'
import { initScript } from './init-script'

import page from './page'

import alias from './alias'

const defaultVersion = 'latest'

declare global {
  interface Window {
    Ripe: RipeSDK
  }
}

export const destination: BrowserDestinationDefinition<Settings, RipeSDK> = {
  name: 'Ripe',
  slug: 'actions-ripe',
  mode: 'device',

  settings: {
    sdkVersion: {
      description: 'The version of the Ripe Widget SDK to use',
      label: 'SDK Version',
      type: 'string',
      choices: [
        {
          value: 'latest',
          label: 'latest'
        }
      ],
      default: defaultVersion,
      required: false
    },
    apiKey: {
      description: 'The Ripe API key found in the Ripe App',
      label: 'API Key',
      type: 'string',
      required: true
    }
  },

  initialize: async ({ settings }, deps) => {
    initScript()

    const { sdkVersion, apiKey } = settings
    const version = sdkVersion ?? defaultVersion

    await deps
      .loadScript(`https://storage.googleapis.com/sdk.getripe.com/sdk/${version}/sdk.umd.js`)
      .catch((err) => console.error('Unable to load Ripe SDK script', err))

    await deps.resolveWhen(() => Object.prototype.hasOwnProperty.call(window, 'Ripe'), 100)
    await window.Ripe.init(apiKey)

    return window.Ripe
  },

  actions: {
    alias,
    group,
    identify,
    page,
    track
  },

  presets: [
    {
      name: 'Alias user',
      subscribe: 'type = "alias"',
      partnerAction: 'alias',
      mapping: defaultValues(alias.fields)
    },
    {
      name: 'Group user',
      subscribe: 'type = "group"',
      partnerAction: 'group',
      mapping: defaultValues(group.fields)
    },
    {
      name: 'Identify user',
      subscribe: 'type = "identify"',
      partnerAction: 'identify',
      mapping: defaultValues(identify.fields)
    },
    {
      name: 'Page view',
      subscribe: 'type = "page"',
      partnerAction: 'page',
      mapping: defaultValues(page.fields)
    },
    {
      name: 'Track event',
      subscribe: 'type = "track"',
      partnerAction: 'track',
      mapping: defaultValues(track.fields)
    }
  ]
}

export default browserDestination(destination)
