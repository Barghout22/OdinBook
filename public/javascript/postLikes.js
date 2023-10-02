$(document).ready(function () {
  $(".like-button").on("click", function (e) {
    e.preventDefault();
    const postId = $(this).data("post-id");
    const isLiked = $(this).hasClass("liked");
    $.ajax({
      context: this,
      type: "POST",
      url: `/posts/${postId}/likes`,
      data: { isLiked },
      success: function (data) {
        if (data.isLiked) {
          $(this).addClass("liked");
          $(this).css("color", "#1877f2");
          $(this).text("unlike");
        } else {
          $(this).removeClass("liked");
          $(this).css("color", "black");
          $(this).text("like");
        }
        const likesCount = data.likesCount;
        const likesCountElement = $(`#likes-count-${postId}`);
        if (likesCount > 1) {
          likesCountElement.text(likesCount + " likes").show();
        } else if (likesCount === 1) {
          likesCountElement.text(likesCount + " like").show();
        } else {
          likesCountElement.hide();
        }
      },
      error: function (err) {
        console.error("Error:", err);
      },
    });
  });
});
