$(document).ready(function () {
  $(".like-comment-button").on("click", function (e) {
    e.preventDefault();
    const commentId = $(this).data("comment-id");
    const isLiked = $(this).hasClass("liked");
    $.ajax({
      context: this,
      type: "POST",
      url: `/comments/${commentId}/likes`,
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
      },
      error: function (err) {
        console.error("Error:", err);
      },
    });
  });
});
