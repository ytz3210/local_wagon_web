const path = require('path')
const webpack = require('webpack')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463
   */
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  /*
  pages: {
    index: {
      entry: 'src/main.js',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  */
  configureWebpack: {
    externals: {
      'BMap': 'BMap',
      'BMapLib': 'BMapLib'
    },
    plugins: [

      new webpack.ProvidePlugin({

        $: 'jquery',

        jQuery: 'jquery',

        'windows.jQuery': 'jquery'

      })

    ]
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@layout', resolve('src/layout'))
      .set('@static', resolve('src/static'))
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */


          primaryColor: '#1890FF', // primary color of ant design
          navTheme: 'dark', // theme for nav menu
          layout: 'sidemenu', // nav menu position: sidemenu or topmenu
          contentWidth: 'Fixed', // layout of content: Fluid or Fixed, only works when layout is topmenu
          fixedHeader: false, // sticky header
          fixSiderbar: false, // sticky siderbar
          autoHideHeader: false, //  auto hide header
          colorWeak: false,
          multipage: false, //默认多页签模式
          // vue-ls options
          storageOptions: {
            namespace: 'pro__', // key prefix
            name: 'ls', // name variable Vue.[ls] or this.[$ls],
            storage: 'local' // storage name session, local, memory
          }

        },
        javascriptEnabled: true
      }
    }
  },

  // todo 等待修改
  devServer: {
    port: 3000,
    proxy: {
      // 管车 api 服务器
      '/jeecg-boot/api': {
        target: 'http://localhost:5000', //mock API接口系统
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '/jeecg-boot': ''  //默认所有请求都加了jeecg-boot前缀，需要去掉
        }
      },
      // 原生系统模块
      '/jeecg-boot': {
        target: 'http://127.0.0.1:8080', //请求本地 需要jeecg-boot后台项目
        ws: false,
        changeOrigin: true
      }
    }
  },

  lintOnSave: undefined
}