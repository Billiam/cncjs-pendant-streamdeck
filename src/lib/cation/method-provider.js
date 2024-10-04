import { resolveDependencies } from 'cation/dist/helpers/service'
import ServiceProvider from 'cation/dist/providers/serviceprovider'

// acts the same as ServiceProvider but doesn't use "new" constructor
class MethodProvider extends ServiceProvider {
  /*
   * Constructor
   *
   * @param {Cation} container A Cation instance
   * @param {String} id        The Resource ID
   * @param {mixed}  resource  The Resource Object
   * @param {Object} options   The register options
   */
  constructor(container, id, resource, options) {
    super(container, id, resource, options)
  }

  get() {
    // resolve arguments
    let serviceDepsPromise = resolveDependencies(
      this.container,
      this.options.args,
    )

    return serviceDepsPromise.then((serviceDeps) => {
      serviceDeps.unshift(this.resource)

      const Resource = this.resource.bind.apply(this.resource, serviceDeps)
      // bubble a new Promise
      return Resource()
    })
  }
}

export default MethodProvider
