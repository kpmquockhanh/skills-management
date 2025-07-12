<template>
  <div class="flex flex-col gap-4">
    <div
      class="bg-base-100 flex min-h-[6rem] min-w-[18rem] max-w-5xl flex-wrap items-center justify-center gap-2 overflow-x-hidden bg-cover bg-top"
      style="">
      <div class="overflow-x-auto w-full">
        <div v-if="attachmentStore.isLoading" class="skeleton h-16 w-full"></div>
        <template v-else>
          <div class="text-center">There are {{ attachmentStore.unusedItems.length }} unused attachments</div>
          <table class="table" v-if="attachmentStore.unusedItems.length">
            <thead>
            <tr>
              <th><label><input type="checkbox" class="checkbox"></label></th>
              <th>Item</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="attachment in attachmentStore.unusedItems" :key="attachment.id">
              <th><label><input type="checkbox" class="checkbox"></label></th>
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar">
                    <div class="w-12 h-12 mask mask-squircle">
                      <img :src="getSrc(attachment.fullPath, true)" alt="Avatar Tailwind CSS Component">
                    </div>
                  </div>
                  <div>
                    <div class="font-bold">{{ attachment.fileName }}</div>
                    <!--                  <div class="text-sm opacity-50">United States</div>-->
                  </div>
                </div>
              </td>
              <th>
                <button class="btn btn-xs btn-error" @click="onDelete(attachment)">remove</button>
              </th>
            </tr>
            </tbody>
          </table>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { useAttachment } from '@/stores/attachment'
import {getSrc} from '@/utils'

const attachmentStore = useAttachment()

const onDelete = (attachment) => {
  attachmentStore.deleteUnusedAttachment(attachment.id).then(() => {
    attachmentStore.fetchUnusedAttachments().then()
  })
}
onMounted(() => {
  attachmentStore.fetchUnusedAttachments().then()
})

</script>
