<script setup lang="ts">
import { computed, nextTick, ref, type Ref, watch, onMounted } from 'vue'
import ArrowEnterLeft24Regular from '@vicons/fluent/ArrowEnterLeft24Regular'
import { Icon } from '@vicons/utils'

const question_textarea: Ref<HTMLTextAreaElement | null> = ref(null)
const name_textarea: Ref<HTMLTextAreaElement | null> = ref(null)
const questions = ref('')
const names = ref('')
const mode = ref('questions_names')
const type = ref('one')
const myModal = ref<any>()
const closeAndRemoveBtn: Ref<HTMLButtonElement | null> = ref(null)

const randomName = ref('')
const randomQuestion = ref('')

const selectedNames = ref<string[]>([])
const selectedQuestions = ref<string[]>([])

const isShowQuestions = computed(() => {
  return ['questions', 'questions_names'].includes(mode.value)
})
const isShowNames = computed(() => {
  return ['questions_names', 'names'].includes(mode.value)
})


const processedQuestions = computed(() => {
  const rs = questions.value.split('\n').map((item) => item.trim()).filter((item) => item).filter((item) => !selectedQuestions.value.includes(item));
  if (!rs || !rs.length) {
    return ['N/A']
  }
  return rs
});
const processedNames = computed(() => {
  const rs = names.value.split('\n').map((item) => item.trim()).filter((item) => item).filter((item) => !selectedNames.value.includes(item));
  if (!rs || !rs.length) {
    return ['N/A']
  }
  return rs
})

const isInvalidSubmit = computed(() => {
  const validNames = !!processedNames.value.filter((item) => item !== 'N/A').length
  const validQuestions = !!processedQuestions.value.filter((item) => item !== 'N/A').length

  if (isShowNames.value && isShowQuestions.value) {
    return !validNames || !validQuestions
  }

  if (isShowQuestions.value) {
    return !validQuestions
  }

  if (isShowNames.value) {
    return !validNames
  }

  return false
})

const onSubmit = () => {
  if (isInvalidSubmit.value || !myModal.value) {
    return
  }

  if (isShowNames.value) {
    const names = processedNames.value
    randomName.value = names[Math.floor(Math.random() * names.length)]
  }

  if (isShowQuestions.value) {
    const questions = processedQuestions.value
    randomQuestion.value = questions[Math.floor(Math.random() * questions.length)]
  }

  nextTick(() => {
    closeAndRemoveBtn.value?.focus()
  })
  myModal.value?.showModal()
}

const onCloseModal = (e: MouseEvent, isKeep = false) => {
  if (!myModal.value) {
    return
  }
  if (isKeep) {
    myModal.value?.close()
    return
  }

  if (isShowNames.value) {
    const names = processedNames.value
    const index = names.indexOf(randomName.value)
    if (index > -1) {
      names.splice(index, 1)
    }
    selectedNames.value.push(randomName.value)
  }

  if (isShowQuestions.value) {
    const questions = processedQuestions.value
    const index = questions.indexOf(randomQuestion.value)
    if (index > -1) {
      questions.splice(index, 1)
    }
    selectedQuestions.value.push(randomQuestion.value)
  }
  myModal.value?.close()
}

watch(questions, () => {
  if (!question_textarea.value) return
  question_textarea.value.style.height = 'auto'
  nextTick(() => {
    if (!question_textarea.value) return
    question_textarea.value.style.height = question_textarea.value.scrollHeight + 'px'
  })
})

watch(names, () => {
  if (!name_textarea.value) return
  name_textarea.value.style.height = 'auto'
  nextTick(() => {
    if (!name_textarea.value) return
    name_textarea.value.style.height = name_textarea.value.scrollHeight + 'px'
  })
})

onMounted(() => {
  // Handle event on key up shift + enter
  window.addEventListener('keyup', (e) => {
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  })
})

</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="w-full py-2 flex gap-4 items-center justify-end">
      <select
        v-model="mode"
        class="select select-bordered select-accent w-full max-w-xs"
      >
        <option
          disabled
          selected
        >
          What mode do you want?
        </option>
        <option value="questions">
          Questions only
        </option>
        <option value="questions_names">
          Questions and names
        </option>
        <option value="names">
          Names only
        </option>
      </select>
      <select
        v-model="type"
        class="select select-bordered select-primary w-full max-w-xs"
      >
        <option
          disabled
          selected
        >
          Select type?
        </option>
        <option value="one">
          One by one
        </option>
        <option value="all">
          All in one
        </option>
      </select>
    </div>
    <div class="flex gap-4">
      <div
        v-if="isShowQuestions"
        class="flex flex-col gap-2"
        :class="[mode === 'questions_names' ? 'w-1/2' : 'w-full']"
      >
        <div class="text font-bold">
          Questions
        </div>
        <textarea
          ref="question_textarea"
          v-model="questions"
          class="textarea textarea-bordered w-full"
          placeholder="..."
          rows="10"
        />
        <div class="flex gap-1 italic mt-2">
          <div class="whitespace-nowrap">Selected questions:</div>
          <div>{{ selectedQuestions.length ? selectedQuestions.join(', ') : 'N/A' }}</div>
        </div>
        <div class="flex gap-1 italic mt-2">
          <div class="whitespace-nowrap">Available questions:</div>
          <div>{{ processedQuestions.join(', ') }}</div>
        </div>
      </div>
      <div
        v-if="isShowNames"
        class="flex flex-col gap-2"
        :class="[mode === 'questions_names' ? 'w-1/2' : 'w-full']"
      >
        <div class="text font-bold">
          Names
        </div>
        <textarea
          ref="name_textarea"
          v-model="names"
          class="textarea textarea-bordered w-full"
          placeholder="..."
          rows="10"
        />
        <div class="flex gap-1 italic mt-2">
          <div class="whitespace-nowrap">Selected names:</div>
          <div>{{ selectedNames.length ? selectedNames.join(', ') : 'N/A' }}</div>
        </div>
        <div class="flex gap-1 italic mt-2">
          <div class="whitespace-nowrap">Available names:</div>
          <div>{{ processedNames.join(', ') }}</div>
        </div>
      </div>
    </div>

    <div class="w-full py-2 flex gap-4 items-center justify-end">
      <router-link
        to="/"
        class="btn btn-outline-primary"
      >
        Back to home page
      </router-link>
      <button
        class="btn btn-primary"
        @click="onSubmit"
        :disabled="isInvalidSubmit"
      >
        Execute
        <kbd class="kbd kbd-sm text-black">
          <span class="text-xs">Shift</span>
        </kbd>
        <span>+</span>
        <kbd class="kbd kbd-sm text-black">
          <Icon>
            <ArrowEnterLeft24Regular />
          </Icon>
        </kbd>
      </button>
    </div>
    <dialog
      id="my_modal_3"
      ref="myModal"
      class="modal"
    >
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 class="font-bold text-lg">
          Result!!!
        </h3>
        <div class="pt-4 pb-2">
          <p class="text-2xl pb-2" v-if="isShowNames">
            For: <strong>{{ randomName }}</strong>.
          </p>
          <p class="text-xl mt-3" v-if="isShowQuestions">
            {{ randomQuestion }}
          </p>
        </div>
        <div class="divider" />
        <div class="pt-2 pb-4 flex justify-end gap-4">
          <button
            class="btn btn-outline-secondary"
            @click="onCloseModal($event, true)"
          >
            Close and keep
          </button>
          <button
            class="btn btn-primary"
            ref="closeAndRemoveBtn"
            @click="onCloseModal($event, false)"
          >
            Close and remove
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>
