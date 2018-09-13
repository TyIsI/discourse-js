/** Discourse JS */
import Posts from './resources/Posts'
import Topics from './resources/Topics'

import { createBody, ApiError } from './utils'

const resources = {
  Posts,
  Topics
}

export default class Discourse {
  constructor(apiKey, baseUrl) {
    // Set our api key to the Discourse class.
    this._API_KEY = apiKey
    this._BASE_URL = baseUrl

    for (let resource in resources) {
      this[resource.toLowerCase()] = new resources[resource](this)
    }
  }

  config = ({ apiKey, apiUsername, baseUrl } = {}) => {
    this._API_KEY = apiKey
    this._BASE_URL = baseUrl
    this._API_USERNAME = apiUsername
  }

  DiscourseResource = options => {
    return new Promise((resolve, reject) => {
      const { body, method, path } = options

      const fetchOptions = {
        method,
        mimeType: 'multipart/form-data'
      }

      if (method === 'POST') {
        fetchOptions.body = createBody(body)
        fetchOptions.body.api_key = this._API_KEY
        fetchOptions.body.api_username = this._API_USERNAME
      }

      return fetch(`${this._BASE_URL}/${path}`, fetchOptions)
        .then(response => {
          if (response.ok) {
            return resolve(response.json())
          } else {
            // We have received a bad response, so we should return the response
            // since it contains useful information.
            // We got a bad response. We should return the error.
            let errors = []
            try {
              let json = JSON.parse(response._bodyInit)
              errors = json.errors
            } catch (error) {
              /**
               * If we get an error, it is usually because response._bodyInit is not a JSON object.
               * But actually an error string, so we push it into our array.
               */
              console.warn(`discourse-js: ${error}`) // eslint-disable-line
              errors.push(response._bodyInit)
            }

            const { status, statusText } = response
            return reject(new ApiError(status, statusText, errors))
          }
        })
        .catch(function(error) {
          if (error) {
            return reject(new Error(error))
          }
        })
    })
  }
}