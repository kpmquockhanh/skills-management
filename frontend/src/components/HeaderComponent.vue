<script setup lang="ts">
import { computed, nextTick, type Ref, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserIcon from '@vicons/ionicons5/PersonSharp'
import Alert24Filled from '@vicons/fluent/Alert24Filled'
import { useUser } from '@/stores/user'
import DynamicImage from '@components/DynamicImage.vue'
import { Icon } from '@vicons/utils'
import NotificationComponent from '@components/NotificationComponent.vue'
import PeopleSearch24Filled from '@vicons/fluent/PeopleSearch24Filled'
import Settings24Filled from '@vicons/fluent/Settings24Filled'
import LogOutOutlined from '@vicons/ionicons5/LogOutOutline'
import LogInOutlined from '@vicons/ionicons5/LogInOutline'
import Key24Filled from '@vicons/fluent/Key24Filled'
import { getSrc } from '@/utils'

const menu = ref([
  {
    name: 'home',
    label: 'Home'
  },
  {
    name: 'chat-list',
    label: 'Chat'
  },
  {
    name: 'settings',
    label: 'Settings'
  },
  {
    name: 'tools',
    label: 'Tools',
    children: [
      {
        name: 'randomPage',
        label: 'Random'
      },
      {
        name: 'ai_number',
        label: 'Number prediction'
      }
      // {
      //   name: 'questionPage',
      //   label: 'Questions'
      // }
    ]
  }
])

const accountMenu = computed(() => [
  {
    name: 'login',
    label: 'Login',
    show: !authState.isAuth,
    icon: LogInOutlined
  },
  {
    name: 'register',
    label: 'Register',
    show: !authState.isAuth,
    icon: Key24Filled
  },
  {
    name: 'friends',
    label: 'Find friends',
    show: authState.isAuth,
    icon: PeopleSearch24Filled
  },
  {
    name: 'settings',
    label: 'Settings',
    show: authState.isAuth,
    icon: Settings24Filled
  },
  {
    name: 'logout',
    label: 'Logout',
    show: authState.isAuth,
    action: onLogout,
    icon: LogOutOutlined
  }
])

const route = useRoute()
const router = useRouter()
const authState = useAuthStore()
const user = useUser()

const isOpen: Ref<Map<string, boolean>> = ref(new Map())

watch(route, () => {
  isOpen.value = new Map()
})

const onMyToggle = (e: ToggleEvent, name: string) => {
  isOpen.value.set(name, e.newState === 'open')
  for (const key of isOpen.value.keys()) {
    if (key !== name && e.newState === 'open') {
      isOpen.value.set(key, false)
    }
  }
}

const onLogout = () => {
  authState.logout()
  router.push({
    name: 'login'
  })
}

const appName = computed(() => {
  return import.meta.env.VITE_APP_NAME
})

const onFocusOut = (name: string) => {
  console.log('on focus out', name)
  nextTick(() => {
    // isOpen.value.set(name, false);
  })
}
</script>

<template>
  <div class="navbar bg-base-100 z-10">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul tabindex="0" class="menu menu-md dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li
            v-for="item in menu"
            :key="item.name"
            class="mb-1 last:mb-0"
          >
            <router-link
              v-if="!item.children"
              :to="{name: item.name}"
              :class="[{'active': $route.name === item.name}, 'mr-1']"
            >
              {{ item.label }}
            </router-link>
            <details
              v-else
              :open="isOpen.get(item.name)"
              @toggle="onMyToggle($event, item.name)"
            >
              <summary>
                {{ item.label }}
              </summary>
              <ul class="p-2 bg-base-100 rounded-t-none">
                <li
                  v-for="childItem in item.children"
                  :key="childItem.name"
                >
                  <router-link
                    :to="{name: childItem.name}"
                    :class="[{'active': $route.name === childItem.name}, 'mt-1']"
                  >
                    {{ childItem.label }}
                  </router-link>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <router-link
        :to="{name: 'home'}"
        class="btn btn-ghost text-xl px-2"
      >
        {{ appName }}
      </router-link>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li
          v-for="item in menu"
          :key="item.name"
        >
          <router-link
            v-if="!item.children"
            :to="{name: item.name}"
            :class="[{'active': $route.name === item.name}, 'mr-1']"
          >
            {{ item.label }}
          </router-link>
          <details
            v-else
            :open="isOpen.get(item.name)"
            @toggle="onMyToggle($event, item.name)"
          >
            <summary>
              {{ item.label }}
            </summary>
            <ul class="p-2 bg-base-100 rounded-t-none">
              <li
                v-for="childItem in item.children"
                :key="childItem.name"
              >
                <router-link
                  :to="{name: childItem.name}"
                  :class="[{'active': $route.name === childItem.name}, 'mt-1']"
                >
                  {{ childItem.label }}
                </router-link>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
    <div class="navbar-end gap-4">
      <details
        v-if="authState.isAuth"
        class="dropdown dropdown-end"
        :open="isOpen.get('notification')"
        @toggle="onMyToggle($event, 'notification')"
      >
        <summary class="btn btn-ghost btn-circle avatar online">
          <div class="w-10">
            <div class="flex justify-center items-center h-full">
              <Icon size="24">
                <Alert24Filled />
              </Icon>
            </div>
          </div>
        </summary>
        <div class="dropdown-content bg-base-100 rounded-box z-[1] w-72 p-2 shadow">
          <NotificationComponent />
        </div>
      </details>

      <details
        class="dropdown dropdown-end"
        :open="isOpen.get('account')"
        @toggle="onMyToggle($event, 'account')"
      >
        <summary class="btn btn-ghost btn-circle avatar">
          <div
            class="w-10 rounded-full ring ring-gray-600 ring-offset-base-100 ring-offset-1 flex items-center justify-center">
            <UserIcon v-if="!user.user?.photoUrl" />
            <DynamicImage
              v-else
              :src="getSrc(user.user?.photoUrl, true)"
              alt="profile"
              :loading-height="40"
              :loading-width="40"
            />
          </div>
        </summary>
        <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li v-for="menu in accountMenu.filter((m) => m.show)" :key="menu.name" class="mb-1 last:mb-0">
            <router-link
              v-if="!menu.action"
              :to="{name: menu.name}"
              :class="[{'active': $route.name === menu.name}]"
            >
              <div class="flex gap-2 items-center">
                <Icon v-if="menu.icon" size="24">
                  <component :is="menu.icon" />
                </Icon>
                <span>{{ menu.label }}</span>
              </div>
            </router-link>
            <a v-else @click="menu.action">
              <div class="flex gap-2">
                <Icon v-if="menu.icon" size="24">
                  <component :is="menu.icon" />
                </Icon>
                <span>{{ menu.label }}</span>
              </div>
            </a>
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>
