<template >
  <b-container>
    <b-row>
      <b-col class="text-start">
        <h2>Cactpot Solver</h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-row>
          <b-col>
            <MiniCactpotSolver />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <MiniCactpotSolver />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <MiniCactpotSolver />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import MiniCactpotSolver from '../components/MiniCactpotSolver.vue'
export default {
  name: 'Cactpot',
  components: {
    MiniCactpotSolver
  }
}
</script>

<style scoped>

</style>
