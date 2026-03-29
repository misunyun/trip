$(document).ready( function() {
	/* 주문결제 신라페에 간편결제 카드 슬롯 */

	var swiper02 = new Swiper('.pay_item', {
		nextButton: '.swiper-button-next',
		prevButton: '.swiper-button-prev',
		pagination: {
			el:'.swiper-pagination',
			type:'fraction',
		},
	
		slidesPerView: 'auto',
		paginationClickable: false,
		loop: true						
	});

	var swiper03 = new Swiper('.pay_item2', {
		pagination: {
			el:'.swiper-pagination',
			type:'fraction',
			formatFractionTotal : function( number ){
				return (number - 1);
			}
		},								
	
		slidesPerView: 'auto',
		delay:0,
		centeredSlides: true,
		paginationClickable: false,
		observer: true,
		observeParents: true,
		loop: true						
	});

	$('.bank_list li').click(function(){
		$(this).addClass('on').siblings().removeClass('on');
	});

});