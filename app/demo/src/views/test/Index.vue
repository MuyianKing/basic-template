<script setup>
import { StockSDK } from 'stock-sdk'

const sdk = new StockSDK()

const code = '008163'

const funds = await sdk.getFundQuotes([code])

funds.forEach((f) => {
  console.log(`${f.name} (${f.code})`)
  console.log(`  单位净值: ${f.nav}`)
  console.log(`  累计净值: ${f.accNav}`)
  console.log(`  涨跌额: ${f.change}`)
  console.log(`  净值日期: ${f.navDate}`)
})

const funds1 = await sdk.getFundEstimate(code)
console.log(funds1)
</script>

<template>
  <div>test</div>
</template>

<style lang='scss' scoped></style>
