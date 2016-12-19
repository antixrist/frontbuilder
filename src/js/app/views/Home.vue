<template>
  <div class="page">
    <p>
      <i class="fa fa-folder"></i>
    </p>
    <counter></counter>
    <p>
      To get started, edit files in <code>./client</code> and save.
    </p>
  </div>
</template>

<script>
  import Counter from '../components/counter';

  export default {
    components: { Counter }
  };
</script>
