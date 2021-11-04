import axios from "axios";
const API_SERVER_URL = "http://localhost:3000";

const commentStore = {
    namespaced: true,
    state: {
        blogCommentList: {},
        blogSubCommentList: {},
        commentText: "",
        updateCommentText: "",
        subCommentText: "",
    },
    getters: {},
    mutations: {
        // v-model data 관리
        MODIFY_COMMENT_TEXT(state, payload) {
            state.commentText = payload;
        },

        MODIFY_UPDATED_COMMENT_TEXT(state, payload) {
            state.updateCommentText = payload;
        },

        MODIFY_UPDATED_SUB_COMMENT_TEXT(state, payload) {
            state.subCommentText = payload;
        },

        MODIFY_INITIAL_UPDATE_COMMENT_TEXT(state, payload) {
            state.updateCommentText = payload;
        },

        // 토글 mutation
        TOGGLE_UPDATE_COMMENT(state, blogCommentId) {
            state.blogCommentList.forEach((blogCommentItem) => {
                if (blogCommentItem.comment_id === blogCommentId) {
                    blogCommentItem.updateStatus = !blogCommentItem.updateStatus;
                }
            });
        },

        TOGGLE_UPDATE_SUB_COMMENT(state, blogSubCommentId) {
            state.blogSubCommentList.forEach((blogSubCommentItem) => {
                if (blogSubCommentItem.sub_comment_id === blogSubCommentId) {
                    blogSubCommentItem.updateStatus = !blogSubCommentItem.updateStatus;
                }
            });
        },

        TOGGLE_REGISTER_SUB_COMMENT(state, blogCommentId) {
            state.blogCommentList.forEach((blogCommentItem) => {
                if (blogCommentItem.comment_id === blogCommentId) {
                    blogCommentItem.registerStatus = !blogCommentItem.registerStatus;
                }
            });
        },
    },
    actions: {
        // 게시물 댓글 불러오기
        async getBlogComment({ state }, blogContentId) {
            await axios
                .get(`${API_SERVER_URL}/blog/${blogContentId}/comment`)
                .then(({ data }) => {
                    state.blogCommentList = [...data.data.comment_result].map((item) => {
                        return { ...item, updateStatus: false, registerStatus: false };
                    });
                    state.blogSubCommentList = [...data.data.sub_comment_result].map((item) => {
                        return { ...item, updateStatus: false };
                    });
                })
                .catch((error) => {
                    console.log(error.response);
                });
        },

        // 댓글 등록
        async registerComment({ state, dispatch }, blogContentId) {
            await axios
                .post(
                    `${API_SERVER_URL}/blog/${blogContentId}/comment`,
                    {},
                    {
                        params: {
                            userId: 1,
                            commentText: state.commentText,
                        },
                    }
                )
                .then(() => {
                    dispatch("getBlogComment", blogContentId);
                    dispatch("postStore/getBlogDetail", blogContentId, { root: true });
                })
                .catch((error) => {
                    console.log(error.response);
                });

            state.commentText = "";
        },

        // 댓글 수정
        async updateComment({ state, dispatch, commit }, { blogContentId, blogCommentId }) {
            await axios
                .post(
                    `${API_SERVER_URL}/blog/${blogContentId}/update-comment/${blogCommentId}`,
                    {},
                    {
                        params: {
                            commentText: state.updateCommentText,
                        },
                    }
                )
                .then(() => {
                    dispatch("getBlogComment", blogContentId);
                    commit("TOGGLE_UPDATE_COMMENT", blogCommentId);
                })
                .catch((error) => {
                    console.log(error.response);
                });
        },

        // 댓글 삭제하기
        async deleteComment({ dispatch }, { blogContentId, deleteCommentId }) {
            await axios
                .delete(`${API_SERVER_URL}/blog/${blogContentId}/comment`, {
                    params: {
                        deleteCommentId: deleteCommentId,
                    },
                })
                .then(() => {
                    dispatch("getBlogComment", blogContentId);
                    dispatch("postStore/getBlogDetail", blogContentId, { root: true });
                })
                .catch((error) => {
                    console.log(error.response);
                });
        },

        // 답글 등록
        async registerSubComment({ state, dispatch, commit }, { blogContentId, blogCommentId }) {
            await axios
                .post(
                    `${API_SERVER_URL}/blog/${blogContentId}/comment/${blogCommentId}`,
                    {},
                    {
                        params: {
                            userId: 1,
                            commentText: state.subCommentText,
                        },
                    }
                )
                .then(() => {
                    dispatch("getBlogComment", blogContentId);
                    dispatch("postStore/getBlogDetail", blogContentId, { root: true });
                    commit("TOGGLE_REGISTER_SUB_COMMENT", blogCommentId);
                    state.subCommentText = "";
                })
                .catch((error) => {
                    console.log(error.response);
                });
        },

        // 답글 수정
        async updateSubComment({ state, dispatch, commit }, { blogContentId, blogCommentId }) {
            await axios
                .post(
                    `${API_SERVER_URL}/blog/${blogContentId}/update-comment/${blogCommentId}`,
                    {},
                    {
                        params: {
                            commentText: state.updateCommentText,
                            subCommentId: blogCommentId,
                        },
                    }
                )
                .then(() => {
                    dispatch("getBlogComment", blogContentId);
                    commit("TOGGLE_UPDATE_SUB_COMMENT", blogCommentId);
                })
                .catch((error) => {
                    console.log(error.response);
                });
        },

        // 답글 삭제하기
        async deleteSubComment({ dispatch }, { blogContentId, deleteSubCommentId }) {
            console.log(blogContentId, deleteSubCommentId);
            await axios
                .delete(`${API_SERVER_URL}/blog/${blogContentId}/comment`, {
                    params: {
                        deleteSubCommentId: deleteSubCommentId,
                    },
                })
                .then(() => {
                    dispatch("getBlogComment", blogContentId);
                    dispatch("postStore/getBlogDetail", blogContentId, { root: true });
                })
                .catch((error) => {
                    console.log(error.response);
                });
        },
    },
};

export default commentStore;
