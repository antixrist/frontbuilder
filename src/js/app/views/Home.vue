<template>
  <div>
    <div v-for="idx of 2"
         style="display: inline-block; padding: 50px; vertical-align: top;"
    >
      <template v-if="idx == 1">
        <div :class="`box-${idx}`">
          <div :class="`box-${idx}-1`">Это коробка {{ idx }}-1</div>
          <div :class="`box-${idx}-1`">Это коробка {{ idx }}-1</div>
          <div :class="`box-${idx}-2`">Это коробка {{ idx }}-2</div>
          <div :class="`box-${idx}-2`">Это коробка {{ idx }}-2</div>
        </div>
      </template>
      <template v-else>
        <div class="box-2">
          <div class="box-2-1">
            <template v-for="idx in 15">
              <div class="box-block"
                   :class="{'out-x': idx % 2 == 0}"
              >
                <div class="box-block-inner">
                  Lorem ipsum dolor sit amet.
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
    
    <div class="page">
      <p>
        <i class="fa fa-folder"></i>
      </p>
      <counter></counter>
      <p>
        To get started, edit files in <code>./client</code> and save.
      </p>
    </div>
  </div>
</template>

<script>
  import Counter from '../components/counter';

  export default {
    components: { Counter }
  };
</script>
