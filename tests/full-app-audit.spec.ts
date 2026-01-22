import { test, expect, Page } from '@playwright/test'

interface TestResult {
  page: string
  status: 'OK' | 'ERROR' | 'SLOW'
  loadTime: number
  errors: string[]
}

const PAGES = [
  { path: '/', name: 'Dashboard' },
  { path: '/documentos', name: 'Documentos' },
  { path: '/documentos/nuevo', name: 'Nuevo Documento' },
  { path: '/empresas', name: 'Empresas' },
  { path: '/trabajadores', name: 'Trabajadores' },
  { path: '/usuarios', name: 'Usuarios' },
  { path: '/auditoria', name: 'Auditoria' },
  { path: '/configuracion', name: 'Configuracion' },
]

const USERS = [
  { role: 'admin', email: 'admin@arl.com', password: 'Admin123!' },
  { role: 'supervisor', email: 'supervisor@arl.com', password: 'Super123!' },
  { role: 'digitador', email: 'digitador@arl.com', password: 'Digit123!' },
  { role: 'consultor', email: 'consultor@arl.com', password: 'Consul123!' },
]

const BASE_URL = 'http://localhost:3000'
const SLOW_THRESHOLD = 3000

async function measurePageLoad(page: Page, url: string): Promise<{ loadTime: number; errors: string[] }> {
  const errors: string[] = []

  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  }

  const errorHandler = (error: Error) => {
    errors.push(error.message)
  }

  page.on('console', consoleHandler)
  page.on('pageerror', errorHandler)

  const start = Date.now()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForLoadState('domcontentloaded')
  } catch (e: any) {
    errors.push('Navigation error: ' + e.message)
  }

  const loadTime = Date.now() - start

  page.removeListener('console', consoleHandler)
  page.removeListener('pageerror', errorHandler)

  return { loadTime, errors }
}

async function login(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' })

    // Wait for seed to complete - the form appears when isReady is true
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await page.waitForTimeout(1000) // Extra wait for seed to complete

    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')

    await page.waitForURL('**/', { timeout: 15000 })
    return true
  } catch (e) {
    return false
  }
}

test.describe('Full Application Audit', () => {
  test('Complete system verification', async ({ page }) => {
    const sep = '='.repeat(80)
    const sep2 = '-'.repeat(60)

    console.log('\n' + sep)
    console.log('INFORME DE AUDITORIA - SISTEMA DE GESTION DOCUMENTAL')
    console.log(sep)
    console.log('Fecha: ' + new Date().toLocaleString('es-CO'))
    console.log('URL Base: ' + BASE_URL)
    console.log(sep + '\n')

    let totalErrors = 0
    let totalSlowPages = 0
    let totalPagesChecked = 0
    let totalLoadTime = 0
    let usersLoggedIn = 0

    // Test login page first
    console.log('VERIFICACION DE PAGINA DE LOGIN')
    console.log(sep2)
    const loginResult = await measurePageLoad(page, BASE_URL + '/login')
    totalPagesChecked++
    totalLoadTime += loginResult.loadTime
    console.log('  Tiempo de carga: ' + loginResult.loadTime + 'ms')
    if (loginResult.loadTime > SLOW_THRESHOLD) {
      console.log('  [LENTO] Mayor a ' + SLOW_THRESHOLD + 'ms')
      totalSlowPages++
    }
    if (loginResult.errors.length > 0) {
      console.log('  [ERROR] Errores: ' + loginResult.errors.join(', '))
      totalErrors += loginResult.errors.length
    } else {
      console.log('  [OK] Sin errores de consola')
    }
    console.log('')

    // Test each user
    for (const user of USERS) {
      console.log('\n' + sep)
      console.log('USUARIO: ' + user.role.toUpperCase() + ' (' + user.email + ')')
      console.log(sep)

      // Login
      console.log('\nIniciando sesion...')
      const loginSuccess = await login(page, user.email, user.password)

      if (!loginSuccess) {
        console.log('  [ERROR] Login fallido para ' + user.email)
        console.log('  [INFO] Usuario puede no existir en la base de datos')
        continue
      }
      console.log('  [OK] Login exitoso')
      usersLoggedIn++

      // Test each page
      console.log('\nVERIFICACION DE PAGINAS:')
      console.log(sep2)

      for (const pageInfo of PAGES) {
        const url = BASE_URL + pageInfo.path
        const result = await measurePageLoad(page, url)
        totalPagesChecked++
        totalLoadTime += result.loadTime

        let status = 'OK'
        let statusIcon = '[OK]'

        if (result.errors.length > 0) {
          status = 'ERROR'
          statusIcon = '[ERROR]'
          totalErrors += result.errors.length
        } else if (result.loadTime > SLOW_THRESHOLD) {
          status = 'SLOW'
          statusIcon = '[LENTO]'
          totalSlowPages++
        }

        const pageName = (pageInfo.name + '                    ').substring(0, 20)
        const loadTimeStr = ('     ' + result.loadTime).slice(-5)
        console.log('  ' + statusIcon + ' ' + pageName + ' | ' + loadTimeStr + 'ms | ' + status)

        if (result.errors.length > 0) {
          result.errors.forEach(err => {
            console.log('      Error: ' + err.substring(0, 100))
          })
        }

        // Check for actual 404 page (not just any text containing 404)
        const title = await page.title()
        const has404Page = title.toLowerCase().includes('404') || title.toLowerCase().includes('not found')
        if (has404Page) {
          console.log('      [WARN] Pagina no encontrada (404)')
        }

        // Check for key elements on each page
        const hasMainContent = await page.locator('main, [role="main"], .space-y-6').first().isVisible().catch(() => false)
        if (!hasMainContent) {
          console.log('      [WARN] Contenido principal no visible')
        }
      }

      // Logout
      try {
        await page.evaluate(() => localStorage.clear())
      } catch (e) {}
    }

    // Summary
    console.log('\n' + sep)
    console.log('RESUMEN FINAL')
    console.log(sep)

    const avgLoadTime = totalPagesChecked > 0
      ? Math.round(totalLoadTime / totalPagesChecked)
      : 0

    console.log('\nESTADISTICAS:')
    console.log('   Total paginas verificadas: ' + totalPagesChecked)
    console.log('   Usuarios probados: ' + usersLoggedIn + '/' + USERS.length)
    console.log('   Tiempo promedio de carga: ' + avgLoadTime + 'ms')
    console.log('   Paginas lentas (> ' + SLOW_THRESHOLD + 'ms): ' + totalSlowPages)
    console.log('   Errores totales: ' + totalErrors)

    console.log('\nEVALUACION:')
    if (totalErrors === 0 && totalSlowPages === 0) {
      console.log('   [OK] SISTEMA FUNCIONANDO CORRECTAMENTE')
    } else if (totalErrors > 0) {
      console.log('   [ERROR] SE ENCONTRARON ERRORES - REQUIERE ATENCION')
    } else if (totalSlowPages > 0) {
      console.log('   [WARN] PROBLEMAS DE RENDIMIENTO DETECTADOS')
    }

    console.log('\nRECOMENDACIONES:')
    if (avgLoadTime > 2000) {
      console.log('   - Considerar optimizacion de carga inicial (lazy loading)')
      console.log('   - Revisar tamano de bundles de JavaScript')
      console.log('   - Implementar code splitting')
    }
    if (totalErrors > 0) {
      console.log('   - Revisar errores de consola en detalle')
      console.log('   - Verificar que IndexedDB este funcionando')
    }
    if (usersLoggedIn < USERS.length) {
      console.log('   - Crear usuarios de prueba: npm run db:seed')
    }
    if (totalErrors === 0 && totalSlowPages === 0 && avgLoadTime <= 2000) {
      console.log('   - Sistema funcionando optimamente')
    }

    console.log('\n' + sep)
    console.log('FIN DEL INFORME')
    console.log(sep + '\n')

    // Test passes if no critical errors (allow slow pages)
    expect(totalErrors).toBeLessThanOrEqual(5)
  })
})
