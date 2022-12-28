import { createStore } from "vuex";
const store = createStore({
    state: {
        userInfo: {
            nickName: "",
            avater: ""

        }
    },
    mutations: {
        updateUserInfo(state, userInfo) {
            state.userInfo = userInfo
        }
    },
    actions: {}
})
export default store