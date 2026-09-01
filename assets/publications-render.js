/* Renders the HCI Lab publication list from assets/publications_new.js
   Only entries flagged hcilab:1 are displayed, grouped by year (newest first). */
(function () {
	'use strict';

	var listEl = document.querySelector('#publications-list');
	if (!listEl || typeof publications === 'undefined') return;

	var controlsEl = document.querySelector('#publications-controls');
	var countEl = document.querySelector('#publications-count');
	var statEl = document.querySelector('#stat-pubs');

	var items = publications.filter(function (p) { return p.hcilab === 1; });

	// t: 0 = lab director, 1 = faculty collaborator, 2 = student / research assistant
	function authorName(a) {
		var name = [a.fn, a.ln].filter(Boolean).join(' ');
		if (a.t === 0) return '<span class="author-pi">' + name + '</span>';
		if (a.t === 2) return '<span class="author-student">' + name + '</span>';
		return name;
	}

	function entry(p) {
		var authors = (p.authors || []).map(authorName).join(', ');
		var venue = p.book ? p.book + ', ' + p.publication : p.publication;
		var title = p.url
			? '<a class="pub-title" href="' + p.url + '" target="_blank" rel="noopener">' + p.title + '</a>'
			: '<span class="pub-title">' + p.title + '</span>';
		var badge = p.status === 1 ? '' : '<span class="badge">In press</span>';
		return '<li>' + authors + '. ' + title +
			'<br><span class="pub-venue">' + venue + ', ' + p.year + '</span>' + badge + '</li>';
	}

	function render(filter) {
		var list = filter === 'all'
			? items
			: items.filter(function (p) { return p.type === filter; });

		var years = list.map(function (p) { return p.year; })
			.filter(function (y, i, all) { return all.indexOf(y) === i; })
			.sort(function (a, b) { return b - a; });

		var html = '';
		var start = 1;
		years.forEach(function (year) {
			var group = list.filter(function (p) { return p.year === year; });
			var label = group.length + (group.length === 1 ? ' publication' : ' publications');
			html += '<div class="pub-year">' +
				'<h3>' + year + '<span class="pub-year-count">' + label + '</span></h3>' +
				'<ol start="' + start + '">' + group.map(entry).join('') + '</ol></div>';
			start += group.length;
		});

		listEl.innerHTML = html || '<div class="empty">No publications in this category yet.</div>';
	}

	// filter chips
	var types = [
		{ key: 'all', label: 'All' },
		{ key: 'journal', label: 'Journal articles' },
		{ key: 'conference', label: 'Conference papers' },
		{ key: 'book', label: 'Book chapters' }
	].filter(function (t) {
		return t.key === 'all' || items.some(function (p) { return p.type === t.key; });
	});

	if (controlsEl && types.length > 2) {
		controlsEl.innerHTML = types.map(function (t, i) {
			var n = t.key === 'all'
				? items.length
				: items.filter(function (p) { return p.type === t.key; }).length;
			return '<button class="chip' + (i === 0 ? ' active' : '') + '" data-filter="' + t.key + '">' +
				t.label + ' <span class="muted">(' + n + ')</span></button>';
		}).join('');

		controlsEl.addEventListener('click', function (e) {
			var chip = e.target.closest('.chip');
			if (!chip) return;
			controlsEl.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
			chip.classList.add('active');
			render(chip.getAttribute('data-filter'));
		});
	}

	var journals = items.filter(function (p) { return p.type === 'journal'; }).length;
	if (countEl) {
		countEl.textContent = items.length + ' peer-reviewed publications, including ' +
			journals + ' journal articles.';
	}
	if (statEl) statEl.textContent = items.length;

	render('all');
}());
