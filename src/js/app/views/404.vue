<template>
  <div>
    <h1>Ноте фаунд!</h1>
    <p>
      Зыс ыз анэкзистинг пафс!
      Трай фром
      <router-link :to="{ name: 'home' }">бегин</router-link>
      ор
      <a href="#" @click.prevent="$router.go(-1);">гоу бэк</a>.
    </p>
  </div>
</template>
