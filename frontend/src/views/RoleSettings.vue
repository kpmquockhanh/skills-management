<template>
  <div class="flex flex-col gap-4">
    <div class="collapse collapse-plus bg-base-200">
      <input type="radio" name="my-accordion-3" checked="checked" />
      <div class="collapse-title text-xl font-medium">Manage roles & permissions</div>
      <div class="collapse-content">
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <div>Roles</div>

            <div class="flex gap-2">
              <input
                v-model="roleName"
                type="text"
                placeholder="Role name"
                class="input input-sm input-bordered w-full"
                @keyup.enter="onAddRole"
              />
              <button class="btn btn-sm btn-primary" @click="onAddRole">Add</button>
            </div>
            <div v-for="role in permissionStore.allItems?.roles" :key="role.name">
              <div class="badge badge-lg rounded-md badge-info gap-2 py-4 hover:scale-105">
                {{ role.name }}
                <svg
                  v-if="role.name.toLowerCase() !== 'sadmin'"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block h-4 w-4 stroke-current cursor-pointer"
                  @click="onRemoveRole(role._id)"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div>Permissions</div>
            <div class="flex gap-2">
              <input
                v-model="permissionName"
                type="text"
                placeholder="Permission name"
                class="input input-sm input-bordered w-full"
                @keyup.enter="onAddPermission"
              />
              <button class="btn btn-sm btn-primary" @click="onAddPermission">Add</button>
            </div>
            <div v-for="permission in permissionStore.allPermissions" :key="permission.id">
              <div class="flex flex-col gap-2">
                <div class="badge badge-lg rounded-md badge-success gap-2 py-4 hover:scale-105">
                  {{ permission.name }}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block h-4 w-4 stroke-current cursor-pointer"
                    @click="onRemovePermission(permission.id)"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="collapse collapse-plus bg-base-200">
      <input type="radio" name="my-accordion-3" />
      <div class="collapse-title text-xl font-medium">Assign roles & permissions</div>
      <div class="collapse-content">
        <div class="grid grid-cols-6 gap-4">
          <div
            v-for="role in permissionStore.allItems?.roles.filter((r) => r.name !== 'SAdmin')"
            :key="role.name"
          >
            <div class="label">
              <span class="label-text font-bold">{{ role.name }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <SCheckbox
                v-for="permission in permissionStore.allPermissions"
                :key="permission.id"
                :id="role._id"
                :label="permission.name"
                :checked="role.permissions.some((p) => p.id === permission.id)"
                @change="onChangeRole(role, permission, $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="collapse collapse-plus bg-base-200 overflow-visible" ref="trigger">
      <input type="radio" name="my-accordion-3" />
      <div class="collapse-title text-xl font-medium">Assign users</div>
      <div class="collapse-content">
        <div class="dropdown w-full">
          <input
            tabindex="0"
            role="button"
            class="input input-sm m-1 w-full"
            placeholder="Search users"
            @keyup.enter="onSearch"
            v-model="q"
          />
          <ul tabindex="0" class="dropdown-content z-10 menu bg-base-100 rounded-box shadow p-1">
            <li v-if="!searchedUser.length"><a href="#">Minimum 5 characters</a></li>
            <li v-for="user in searchedUser" :key="user._id">
              <a href="#" @click.prevent="onSelectUser(user)" class="px-2 py-2 rounded-xl">
                <span class="w-6 h-6" v-if="user.photoUrl">
                  <DynamicImage :src="user.photoUrl" />
                </span>
                <span>{{ user.email }}</span>
              </a>
            </li>
          </ul>
        </div>
        <div v-if="selectedUser">
          <div class="flex gap-4 mt-4">
            <div v-for="role in permissionStore.allItems?.roles" :key="role.name">
              <SCheckbox
                :id="role._id"
                :label="role.name"
                :checked="selectedUser.roles.includes(role._id)"
                @change="onAssignRole(role, selectedUser, $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="js">
import { nextTick, onMounted, ref } from 'vue'
import { usePermissionStore } from '@/stores/permission'
import SCheckbox from './SCheckbox.vue'
import uniq from 'lodash/uniq'
import { useFriendStore } from '@/stores/friend'
import { useUser } from '@/stores/user'
import DynamicImage from '@components/DynamicImage.vue'

const userStore = useUser()
const permissionName = ref('')
const roleName = ref('')
const searchedUser = ref([])
const q = ref('')
const selectedUser = ref(null)
const trigger = ref(null)

const friendStore = useFriendStore()
const permissionStore = usePermissionStore()
const onAddPermission = async () => {
  const r = await permissionStore.createPermission(permissionName.value, '')
  if (!r.error) {
    permissionName.value = ''
    permissionStore.fetchPermissions().then()
  }
}

const onSearch = () => {
  if (!q.value || q.value.length < 5) return
  friendStore.findFriends(q.value).then((r) => {
    searchedUser.value = r
  })
}

const onSelectUser = (user) => {
  selectedUser.value = user
  q.value = user.email
  if (trigger.value) {
    nextTick(() => {
      // Trick for closing the dropdown
      document.querySelector('.btn.btn-ghost.text-xl.px-2').focus()
    })
  }
}

const onAssignRole = async (role, user, ev) => {
  await permissionStore.assignRole(user._id, role._id, ev.target.checked ? 'assign' : 'revoke')
  userStore.fetchUser().then()
}

const onAddRole = async () => {
  const resp = await permissionStore.createRole(roleName.value, '')
  if (!resp.error) {
    roleName.value = ''
    permissionStore.fetchPermissions().then()
  }
}

const onRemovePermission = async (id) => {
  const r = await permissionStore.deletePermission(id)
  if (!r.error) {
    permissionStore.fetchPermissions().then()
    userStore.fetchUser().then()
  }
}

const onRemoveRole = async (id) => {
  const r = await permissionStore.deleteRole(id)
  if (!r.error) {
    permissionStore.fetchPermissions().then()
    userStore.fetchUser().then()
  }
}

const onChangeRole = async (role, newPermission, ev) => {
  let permissions = [...role.permissions]
  if (!ev.target.checked) {
    permissions = permissions.filter((p) => p !== newPermission.id)
  } else {
    permissions = uniq([...role.permissions, newPermission.id])
  }
  const resp = await permissionStore.updateRole({
    _id: role._id,
    name: role.name,
    permissions,
    description: role.description
  })
  if (!resp.error) {
    permissionStore.fetchPermissions().then()
    userStore.fetchUser().then()
  }
}

onMounted(() => {
  permissionStore.fetchPermissions().then()
  userStore.fetchUsers().then()
})
</script>
