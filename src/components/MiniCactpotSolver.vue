<template>
  <b-overlay :show="thinking" :opacity="0.7">
    <template #overlay>
      <div class="text-center">
        <b-icon icon="exclamation-circle-fill" font-scale="3" animation="cylon" variant="info"></b-icon>
        <p id="cancel-label">Thinking</p>
      </div>
    </template>
    <b-container class="cactpot">
          <b-row v-for="(row, idx) in rows" :key="`row-${idx}`">
            <b-col>
              <!-- Empty space for diag reward display-->
            </b-col>
            <b-col v-for="(item, idx2) in row" :key="`${idx}-${idx2}`" :class="item.class">
              <b-form-select v-on:change="compute" v-model="item.value" :options="options"></b-form-select>
            </b-col>
            <b-col>
              {{rewards[rowSum(idx, guess)]}}
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              {{rewards[diag753(guess)]}}
            </b-col>
            <b-col v-for="(row, idx) in rows" :key="`col-${idx}`">
              {{rewards[colSum(idx, guess)]}}
            </b-col>
            <b-col>
              {{rewards[diag159(guess)]}}
            </b-col>
          </b-row>
    </b-container>
  </b-overlay>
</template>

<script>

function permute(arr) {
  var l = arr.length,
      used = Array(l),
      data = Array(l);
  return function* backtracking(pos) {
    if(pos == l) yield data.slice();
    else for(var i=0; i<l; ++i) if(!used[i]) {
      used[i] = true;
      data[pos] = arr[i];
      yield* backtracking(pos+1);
      used[i] = false;
    }
  }(0);
}

export default {
  name: 'MiniCactpotSolver',
  data () {
    return {
      thinking: false,
      options: ['', 1, 2, 3, 4, 5, 6, 7, 8, 9],
      rows: [
        [{value: 0, class: ''}, {value: 0, class: ''}, {value: 0, class: ''}],
        [{value: 0, class: ''}, {value: 0, class: ''}, {value: 0, class: ''}],
        [{value: 0, class: ''}, {value: 0, class: ''}, {value: 0, class: ''}]
      ],
      guess: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ],
      rewards: {
        6: 10000,
        7: 36,
        8: 720,
        9: 360,
        10: 80,
        11: 252,
        12: 108,
        13: 72,
        14: 54,
        15: 180,
        16: 72,
        17: 180,
        18: 119,
        19: 36,
        20: 306,
        21: 1080,
        22: 144,
        23: 1800,
        24: 3600
      }
    }
  },
  methods: {
    compute () {
      this.thinking = true
      if (this.isValid()) {
        /* If valid, then we can look at what numbers we haven't used yet,  */
        const used = []
        this.rows.map((row) => row.map((col) => used.push(col.value)))
        const stillAvailable = this.options.filter((value) => !used.includes(value)).filter((v) => v != '')
        const possibilities = permute(stillAvailable)

        /* Now we can brute force this because I'm not a clever man. */
        let possibility = possibilities.next()
        const bestBoard = {
          configuration: [],
          value: 0
        }
        let boards = 0
        while(!possibility.done) {
          boards = boards + 1
          /* Create a possible board configuration */
          const possibleArrangementOfLeftovers = possibility.value
          const guess = [['','',''],['','',''],['','','']]
          this.rows.map((row, r) => row.map((col, c) => {
            if (col.value) {
              guess[r][c] = col.value
            } else {
              guess[r][c] = possibleArrangementOfLeftovers.pop()
            }
          }))

          /* Compute the expected payout of the values we know */
          let sumsWithKnownValues = 0
          this.rows.map((row, r) => {
            let addSum = false
            row.map((col, c) => {
              if (col.value) {
                addSum = true
                sumsWithKnownValues = sumsWithKnownValues + this.rewards[this.rowSum(c, guess)]
                /* Check if we're on the diag at all */
                if (['[0,0]','[1,1]','[2,2]'].indexOf(`[${r},${c}]`) != -1) {
                  sumsWithKnownValues = sumsWithKnownValues + this.rewards[this.diag159(guess)]
                } else if (['[0,2]','[1,1]','[2,0]'].indexOf(`[${r},${c}]`) != -1) {
                  sumsWithKnownValues = sumsWithKnownValues + this.rewards[this.diag753(guess)]
                }
              }
            })
            if (addSum) {
              sumsWithKnownValues = sumsWithKnownValues + this.rewards[this.colSum(r, guess)]
            }
          })

          if (bestBoard.value <= sumsWithKnownValues) {
            bestBoard.configuration = guess
            bestBoard.value = sumsWithKnownValues
          }

          /* Loop */
          possibility = possibilities.next()
        }

        /* Once we've had 4 turns, we have to choose a line to select. */
        if (stillAvailable.length < 6) {
          /* So, compute the best payout of the guessed board and suggest that to the user */
          let bestR = 0
          let bestC = 0
          let bestReward = 0
          let bestRewardIsDiag = false
          bestBoard.configuration.map((row, r) => {
            const rowReward = this.rewards[this.rowSum(r, bestBoard.configuration)]
            row.map((col, c) => {
              const colReward = this.rewards[this.colSum(c, bestBoard.configuration)]
              if (bestReward < colReward) {
                bestR = r
                bestC = c
                bestReward = colReward
              }
            })
            if (bestReward < rowReward) {
                bestR = r
                bestReward = rowReward
              }
          })
          if  (bestReward < this.rewards[this.diag159(bestBoard.configuration)]) {
            bestReward = this.rewards[this.diag159(bestBoard.configuration)]
            bestRewardIsDiag = true
          }
          if (bestReward < this.rewards[this.diag753(bestBoard.configuration)]) {
            bestReward = this.rewards[this.diag753(bestBoard.configuration)]
            bestRewardIsDiag = true
          }

          /* Assign this now to make writing easier */
          this.guess = bestBoard.configuration

          /* Highlight the suggestion, if the row is better than col, go horizontal, otherwise go vertical */
          /* Unless it's diagonal */
          if (bestRewardIsDiag) {
            if (this.rewards[this.diag159(this.guess)] < this.rewards[this.diag753(this.guess)]) {
              /* Highlight the upward diag of 0,2 -> 2,0 */
              this.rows[0][2].class = "nextmove"
              this.rows[1][1].class = "nextmove"
              this.rows[2][0].class = "nextmove"
            } else {
              /* Highlight the downard diag */
              this.rows[0][0].class = "nextmove"
              this.rows[1][1].class = "nextmove"
              this.rows[2][2].class = "nextmove"
            }
          } else {
            if (this.rewards[this.rowSum(bestR, this.guess)] > this.rewards[this.colSum(bestC, this.guess)]) {
              this.rows[bestR].map((col) => {
                col.class = "nextmove"
              })
            } else {
              this.rows.map((row) => {
                row[bestC].class = "nextmove"
              })
            }
          }

          
        }
        
        console.log('boards', boards)
        console.log(JSON.stringify(bestBoard))
      }
      this.thinking = false
    },
    isValid () {
      const countUsed = {}
      this.options.map((o) => countUsed[o] = 0)
      let isInvalid = false
      this.rows.map((row) => row.map((col) => {
        countUsed[col.value] = countUsed[col.value] + 1
        if (countUsed[col.value] > 1) {
          isInvalid = true
          col.class ="invalid"
        } else {
          col.class = ''
        }
      }))
      return !isInvalid
    },
    rowSum(idx, rows) {
      const values = rows[idx]
      if (values.length) {
        return values.reduce((a,b) => a + b, 0)
      }
      return ''
    },
    colSum(idx, rows) {
      const values = rows.map((row) => row[idx])
      if (values.length) {
        return values.reduce((a,b) => a + b, 0)
      }
      return ''
    },
    diag159(rows) {
      return rows[0][0] + rows[1][1] + rows[2][2]
    },
    diag753(rows) {
      return rows[2][0] + rows[1][1] + rows [1][2]
    }
  }
}
</script>

<style scoped>
  .cactpot {
    border: solid thin;
  }
  .nextmove {
    background-color:green;
  }
  .invalid {
    background-color: red;
  }
</style>
