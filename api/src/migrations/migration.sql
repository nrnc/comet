ALTER TABLE "planet"
    ADD COLUMN "profile" jsonb;
UPDATE planet T
SET profile = (SELECT to_json(concat(
        '{',
        '"avatarURL": "', T."avatarImageUrl", '", ',
        '"bannerURL": "', T."bannerImageUrl", '", ',
        '"color": "', T."themeColor", '", ',
        '"customName": "', T."customName", '", ',
        '"description": ', (SELECT to_json(T."description")),
        '}'))::jsonb AS profile
                FROM planet
                WHERE "name" = T."name")
WHERE 1 = 1;

ALTER TABLE "user"
    ADD COLUMN "settings" jsonb;
UPDATE "user" T
SET settings = (SELECT to_json(concat(
        '{',
        '"appearOffline": ', (SELECT (CASE WHEN T."appearOffline" = TRUE THEN 'true' ELSE 'false' END)
                              FROM "user"
                              WHERE "id" = T."id"),
        '}'))::jsonb AS settings
                FROM "user"
                WHERE "id" = T."id")
WHERE 1 = 1;

ALTER TABLE "user"
    ADD COLUMN "profile" jsonb;
UPDATE "user" T
SET profile = (SELECT to_json(concat(
        '{',
        '"avatarURL": "', T."profilePicUrl", '", ',
        '"bio": ', (SELECT to_json(T."bio")), ', ',
        '"tag": "', T."tag", '", ',
        '"tagColor": "', T."tagColor", '", ',
        '"fullName": "', T."username", '"',
        '}'))::jsonb AS profile
               FROM "user"
               WHERE "id" = T."id")
WHERE 1 = 1;

CREATE OR REPLACE FUNCTION drop_unneeded_tables() RETURNS void AS
$$
BEGIN
    ALTER TABLE planet
        DROP CONSTRAINT "FK_365bc311fee310284e3896041dc";
    DROP TABLE galaxy_planets_planet;
    DROP TABLE galaxy;
    DROP TABLE planet_banned_users_user;
    DROP TABLE post_view;
    DROP TABLE reply_notification;
    DROP TABLE user_blocked_planets_planet;
    DROP TABLE user_blocked_by_user;
    DROP TABLE user_followers_user;
    DROP TABLE user_hidden_posts_post;
    DROP TABLE user_muted_planets_planet;
    DROP TABLE user_saved_comments_comment;
    DROP TABLE user_saved_posts_post;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION drop_unneeded_columns() RETURNS void AS
$$
BEGIN
    ALTER TABLE "user"
        DROP COLUMN "bio";
    ALTER TABLE "user"
        DROP COLUMN "profilePicUrl";
    ALTER TABLE "user"
        DROP COLUMN "bannerImageUrl";
    ALTER TABLE "user"
        DROP COLUMN "ipAddresses";
    ALTER TABLE "user"
        DROP COLUMN "lastPostedAt";
    ALTER TABLE "user"
        DROP COLUMN "lastUploadedImageAt";
    ALTER TABLE "user"
        DROP COLUMN "lastCommentedAt";
    ALTER TABLE "user"
        DROP COLUMN "tag";
    ALTER TABLE "user"
        DROP COLUMN "tagColor";
    ALTER TABLE "user"
        DROP COLUMN "appearOffline";
    ALTER TABLE "user"
        DROP COLUMN "xp";

    ALTER TABLE "comment"
        DROP COLUMN "rootCommentId";
    ALTER TABLE "comment"
        DROP COLUMN "mpath";

    ALTER TABLE "post"
        DROP COLUMN "domain";
    ALTER TABLE "post"
        DROP COLUMN "thumbnailUrl";

    ALTER TABLE "planet"
        DROP COLUMN "allowTextPosts";
    ALTER TABLE "planet"
        DROP COLUMN "allowLinkPosts";
    ALTER TABLE "planet"
        DROP COLUMN "allowImagePosts";
    ALTER TABLE "planet"
        DROP COLUMN "defaultSort";
    ALTER TABLE "planet"
        DROP COLUMN "defaultCommentSort";
    ALTER TABLE "planet"
        DROP COLUMN "avatarImageUrl";
    ALTER TABLE "planet"
        DROP COLUMN "themeColor";
    ALTER TABLE "planet"
        DROP COLUMN "galaxyName";
    ALTER TABLE "planet"
        DROP COLUMN "customName";
    ALTER TABLE "planet"
        DROP COLUMN "modPostsOnly";
    ALTER TABLE "planet"
        DROP COLUMN "bannerImageUrl";
    ALTER TABLE "planet"
        DROP COLUMN "description";

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rename_columns() RETURNS void AS
$$
BEGIN
    ALTER TABLE "comment"
        RENAME COLUMN "authorId" TO "author_id";
    ALTER TABLE "comment"
        RENAME COLUMN "postId" TO "post_id";
    ALTER TABLE "comment"
        RENAME COLUMN "textContent" TO "text_content";
    ALTER TABLE "comment"
        RENAME COLUMN "createdAt" TO "created_at";
    ALTER TABLE "comment"
        RENAME COLUMN "editedAt" TO "edited_at";
    ALTER TABLE "comment"
        RENAME COLUMN "parentCommentId" TO "parent_comment_id";
    ALTER TABLE "comment"
        RENAME COLUMN "endorsementCount" TO "rocket_count";
    ALTER TABLE "comment"
        RENAME COLUMN "removedReason" TO "removed_reason";

    ALTER TABLE "comment_endorsement"
        RENAME COLUMN "userId" TO "user_id";
    ALTER TABLE "comment_endorsement"
        RENAME COLUMN "commentId" TO "comment_id";
    ALTER TABLE "comment_endorsement"
        RENAME COLUMN "createdAt" TO "created_at";

    ALTER TABLE "planet"
        RENAME COLUMN "createdAt" TO "created_at";
    ALTER TABLE "planet"
        RENAME COLUMN "creatorId" TO "creator_id";
    ALTER TABLE "planet"
        ADD COLUMN "temp_name" character varying NOT NULL default '';
    UPDATE "planet" SET "temp_name" = "name";
    ALTER TABLE "planet"
        RENAME COLUMN "name" TO "id";

    ALTER TABLE "planet_moderators_user"
        RENAME COLUMN "planetName" TO "planet_id";
    ALTER TABLE "planet_moderators_user"
        RENAME COLUMN "userId" TO "user_id";

    ALTER TABLE "planet_users_user"
        RENAME COLUMN "planetName" TO "planet_id";
    ALTER TABLE "planet_users_user"
        RENAME COLUMN "userId" TO "user_id";

    ALTER TABLE "post"
        RENAME COLUMN "textContent" TO "text_content";
    ALTER TABLE "post"
        RENAME COLUMN "authorId" TO "author_id";
    ALTER TABLE "post"
        RENAME COLUMN "createdAt" TO "created_at";
    ALTER TABLE "post"
        RENAME COLUMN "editedAt" TO "edited_at";
    ALTER TABLE "post"
        RENAME COLUMN "commentCount" TO "comment_count";
    ALTER TABLE "post"
        RENAME COLUMN "postedToProfile" TO "posted_to_profile";
    ALTER TABLE "post"
        RENAME COLUMN "endorsementCount" TO "rocket_count";
    ALTER TABLE "post"
        RENAME COLUMN "planetName" TO "planet_id";
    ALTER TABLE "post"
        RENAME COLUMN "removedReason" TO "removed_reason";
    ALTER TABLE "post"
        RENAME COLUMN "link" TO "link_url";

    ALTER TABLE "post_endorsement"
        RENAME COLUMN "userId" TO "user_id";
    ALTER TABLE "post_endorsement"
        RENAME COLUMN "postId" TO "post_id";
    ALTER TABLE "post_endorsement"
        RENAME COLUMN "createdAt" TO "created_at";

    ALTER TABLE "user"
        RENAME COLUMN "createdAt" TO "created_at";
    ALTER TABLE "user"
        RENAME COLUMN "lastLogin" TO "last_login";
    ALTER TABLE "user"
        RENAME COLUMN "passwordHash" TO "password_hash";
    ALTER TABLE "user"
        RENAME COLUMN "banReason" TO "ban_reason";
    ALTER TABLE "user"
        RENAME COLUMN "endorsementCount" TO "rocket_count";

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_new_ids() RETURNS void AS
$$
BEGIN
    ALTER TABLE "user"
        ADD COLUMN "_id" bigserial UNIQUE NOT NULL;
    ALTER TABLE "comment"
        ADD COLUMN "_id" bigserial UNIQUE NOT NULL;
    ALTER TABLE "post"
        ADD COLUMN "_id" bigserial UNIQUE NOT NULL;
    ALTER TABLE "planet"
        ADD COLUMN "_id" bigserial UNIQUE NOT NULL;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION update_mm_relation(_relation_table text, _fromEntity text, _pk text, _fk text, _id text,
                                              _otherId text, _compareId text) RETURNS void AS
$$
BEGIN
    EXECUTE 'ALTER TABLE "' || _relation_table || '" DROP CONSTRAINT "' || _pk || '";';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" DROP CONSTRAINT "' || _fk || '";';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" ADD COLUMN "' || _id || '2" bigint NOT NULL default 0;';
    EXECUTE 'UPDATE "' || _relation_table || '" T SET "' || _id || '2" = (SELECT "_id" FROM "' || _fromEntity ||
            '" WHERE ' || _compareId || ' = T."' || _id || '") WHERE 1=1;';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" DROP COLUMN "' || _id || '";';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" ADD CONSTRAINT "' || _fk || '" FOREIGN KEY ("' || _id ||
            '2") REFERENCES "' ||
            _fromEntity || '" (_id) ON DELETE CASCADE;';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" ADD CONSTRAINT "' || _pk || '" PRIMARY KEY ("' || _id || '2", "' ||
            _otherId || '");';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" RENAME COLUMN "' || _id || '2" TO "' || _id || '";';
END ;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION update_relation(_relation_table text, _fromEntity text, _fk text, _id text,
                                           _compareId text, _nullable boolean default false) RETURNS void AS
$$
BEGIN
    EXECUTE 'ALTER TABLE "' || _relation_table || '" DROP CONSTRAINT "' || _fk || '";';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" ADD COLUMN "' || _id || '2" bigint ' ||
            (CASE WHEN _nullable = TRUE THEN '' ELSE 'NOT NULL default 0' END) || ';';
    EXECUTE 'UPDATE "' || _relation_table || '" T SET "' || _id || '2" = (SELECT "_id" FROM "' || _fromEntity ||
            '" WHERE ' || _compareId || ' = T."' || _id || '") WHERE 1=1;';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" DROP COLUMN "' || _id || '";';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" ADD CONSTRAINT "' || _fk || '" FOREIGN KEY ("' || _id ||
            '2") REFERENCES "' ||
            _fromEntity || '" (_id) ON DELETE CASCADE;';
    EXECUTE 'ALTER TABLE "' || _relation_table || '" RENAME COLUMN "' || _id || '2" TO "' || _id || '";';
END ;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION update_entity(_entity text, _pk text) RETURNS void AS
$$
BEGIN
    EXECUTE 'ALTER TABLE "' || _entity || '" DROP CONSTRAINT "' || _pk || '";';
    EXECUTE 'ALTER TABLE "' || _entity || '" DROP COLUMN "id";';
    EXECUTE 'ALTER TABLE "' || _entity || '" RENAME COLUMN "_id" to "id";';
    EXECUTE 'ALTER TABLE "' || _entity || '" ADD CONSTRAINT "'|| _pk ||'" PRIMARY KEY ("id");';
    -- EXECUTE 'ALTER TABLE "' || _entity || '" DROP CONSTRAINT "' || _entity || '__id_key";';
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION renaming() RETURNS void AS
$$
BEGIN
    ALTER TABLE planet
        RENAME COLUMN "temp_name" TO "name";

    ALTER TABLE planet_moderators_user
        RENAME TO planet_moderator;
    ALTER TABLE planet_users_user
        RENAME TO planet_user;
    ALTER TABLE post_endorsement
        RENAME TO post_rocket;
    ALTER TABLE comment_endorsement
        RENAME TO comment_rocket;
END;
$$ LANGUAGE plpgsql;



SELECT "drop_unneeded_tables"();

DELETE FROM "post_endorsement" WHERE "postId" = ANY('{Vn0-PwoEW, fAbJ3KMYA, 4P_7lhcu2, niCc4E3Or, 7dFy40Ta1, GLBZSNLKK, ChZnMrL_-, 4hXd15q59, rpWQjZeBY, 0VOXt-wl4, cndx6Jq__, D_ZCyLgko, _vN4k876l, AVx1ZRCF1, XNshnb-vi, NN5QT2hKK, _jGsfhZar, SCS4HcKx6}'::varchar[]);
DELETE FROM "comment_endorsement" WHERE "commentId" = ANY(SELECT "id" FROM "comment" WHERE "postId" = ANY('{Vn0-PwoEW, fAbJ3KMYA, 4P_7lhcu2, niCc4E3Or, 7dFy40Ta1, GLBZSNLKK, ChZnMrL_-, 4hXd15q59, rpWQjZeBY, 0VOXt-wl4, cndx6Jq__, D_ZCyLgko, _vN4k876l, AVx1ZRCF1, XNshnb-vi, NN5QT2hKK, _jGsfhZar, SCS4HcKx6}'::varchar[]));
DELETE FROM "comment" WHERE "postId" = ANY('{Vn0-PwoEW, fAbJ3KMYA, 4P_7lhcu2, niCc4E3Or, 7dFy40Ta1, GLBZSNLKK, ChZnMrL_-, 4hXd15q59, rpWQjZeBY, 0VOXt-wl4, cndx6Jq__, D_ZCyLgko, _vN4k876l, AVx1ZRCF1, XNshnb-vi, NN5QT2hKK, _jGsfhZar, SCS4HcKx6}'::varchar[]);
DELETE FROM "post" WHERE "id" = ANY('{Vn0-PwoEW, fAbJ3KMYA, 4P_7lhcu2, niCc4E3Or, 7dFy40Ta1, GLBZSNLKK, ChZnMrL_-, 4hXd15q59, rpWQjZeBY, 0VOXt-wl4, cndx6Jq__, D_ZCyLgko, _vN4k876l, AVx1ZRCF1, XNshnb-vi, NN5QT2hKK, _jGsfhZar, SCS4HcKx6}'::varchar[]);

SELECT "drop_unneeded_columns"();
SELECT "rename_columns"();
SELECT "add_new_ids"();

-- Change user IDs

SELECT update_mm_relation('post_endorsement', 'user', 'PK_04d0c35738df2c5eebdf6e16efc',
                          'FK_bef3e152348c13606d92ec61544',
                          'user_id', 'post_id', 'id');
SELECT "update_relation"('post', 'user', 'FK_c6fb082a3114f35d0cc27c518e0', 'author_id', 'id');
SELECT update_mm_relation('comment_endorsement', 'user', 'PK_9698f1b56e7addb07951aeb511d',
                          'FK_238e36e491d26e6ec6dbcecf3f7',
                          'user_id', 'comment_id', 'id');
SELECT "update_relation"('comment', 'user', 'FK_276779da446413a0d79598d4fbd', 'author_id', 'id');
SELECT update_mm_relation('planet_moderators_user', 'user', 'PK_6eff57b593f387409defc011abe',
                          'FK_818d9e5e8d202dec54d4b493e67',
                          'user_id', 'planet_id', 'id');
SELECT update_mm_relation('planet_users_user', 'user', 'PK_a59e8590eebc4943397b1747b59',
                          'FK_43f4337a15dc12b92f03df0e783',
                          'user_id', 'planet_id', 'id');
SELECT "update_relation"('planet', 'user', 'FK_25e33be82bd4d3b5eef5a2fc063', 'creator_id', 'id');

-- Change post IDs

SELECT update_mm_relation('post_endorsement', 'post', 'PK_04d0c35738df2c5eebdf6e16efc',
                          'FK_bef3e152348c13606d92ec61544',
                          'post_id', 'user_id', 'id');
SELECT "update_relation"('post', 'user', 'FK_c6fb082a3114f35d0cc27c518e0', 'author_id', '_id');
SELECT "update_relation"('comment', 'post', 'FK_94a85bb16d24033a2afdd5df060', 'post_id', 'id');

-- Change comment IDs

SELECT update_mm_relation('comment_endorsement', 'comment', 'PK_9698f1b56e7addb07951aeb511d',
                          'FK_13b6eb3e5eb9b7a0a6f24c7d613',
                          'comment_id', 'user_id', 'id');
SELECT "update_relation"('comment', 'user', 'FK_276779da446413a0d79598d4fbd', 'author_id', '_id');
SELECT "update_relation"('comment', 'post', 'FK_94a85bb16d24033a2afdd5df060', 'post_id', '_id');
SELECT "update_relation"('comment', 'comment', 'FK_73aac6035a70c5f0313c939f237', 'parent_comment_id', 'id', true);

-- Change planet IDs

SELECT "update_relation"('planet_moderators_user', 'planet', 'FK_c6f5425ce17e655082497bb224d', 'planet_id', 'id');
SELECT "update_relation"('planet_users_user', 'planet', 'FK_70b6f81d3315e7f90ebbebebcb7', 'planet_id', 'id');
SELECT "update_relation"('post', 'planet', 'FK_c0e17c4026c33f3024968b42294', 'planet_id', 'id');

-- Update entities (_id -> id)

SELECT "update_entity"('user', 'PK_cace4a159ff9f2512dd42373760');
SELECT "update_entity"('comment', 'PK_0b0e4bbc8415ec426f87f3a88e2');
SELECT "update_entity"('planet', 'PK_0c6595b668a276b8482611a20e0');
SELECT "update_entity"('post', 'PK_be5fda3aac270b134ff9c21cdee');

-- Rename tables

SELECT renaming();

ALTER TABLE "comment" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "planet" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "post" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "comment__id_seq" CASCADE;
DROP SEQUENCE "planet__id_seq" CASCADE;
DROP SEQUENCE "post__id_seq" CASCADE;
DROP SEQUENCE "user__id_seq" CASCADE;
ALTER TABLE "planet" DROP CONSTRAINT "planet__id_key" CASCADE;
ALTER TABLE "user" DROP CONSTRAINT "user__id_key" CASCADE;
ALTER TABLE "comment" DROP CONSTRAINT "comment__id_key" CASCADE;
ALTER TABLE "post" DROP CONSTRAINT "post__id_key" CASCADE;

UPDATE "planet" SET name = UPPER(SUBSTRING(name from 1 for 1)) || SUBSTRING(name from 2);

DELETE FROM "post_rocket" WHERE "post_id" = ANY(SELECT "id" FROM "post" WHERE "author_id" = (SELECT "id" FROM "user" WHERE "username" = 'Comet'));
DELETE FROM "comment_rocket" WHERE "comment_id" = ANY(SELECT "id" FROM "comment" WHERE "author_id" = (SELECT "id" FROM "user" WHERE "username" = 'Comet'));
DELETE FROM "comment" WHERE "post_id" = ANY(SELECT "id" FROM "post" WHERE "author_id" = (SELECT "id" FROM "user" WHERE "username" = 'Comet'));
DELETE FROM "post" WHERE "author_id" = (SELECT "id" FROM "user" WHERE "username" = 'Comet');
DELETE FROM "comment_rocket" T WHERE (SELECT "id" FROM "comment" WHERE "id" = T."comment_id") IS NULL;

ALTER TABLE "post" ADD COLUMN "image_urls" text[];
UPDATE "post" T SET "image_urls" = ('{'||(SELECT T."link_url")||'}')::text[] WHERE T."type" = 'IMAGE';
UPDATE "post" T SET "link_url" = NULL WHERE T."type" = 'IMAGE';
ALTER TABLE "post" DROP COLUMN "type";

UPDATE "planet" T SET "name" = 'CometX' WHERE T."name" = 'Comet';

ALTER TABLE "planet" ADD COLUMN "user_count" bigint default 1;
ALTER TABLE "planet" ADD COLUMN "post_count" bigint default 0;
ALTER TABLE "user" ADD COLUMN "post_count" bigint default 0;
ALTER TABLE "user" ADD COLUMN "comment_count" bigint default 0;

ALTER TABLE "post" ALTER COLUMN "rocket_count" TYPE bigint;
ALTER TABLE "post" ALTER COLUMN "comment_count" TYPE bigint;
ALTER TABLE "comment" ALTER COLUMN "rocket_count" TYPE bigint;
ALTER TABLE "user" ALTER COLUMN "rocket_count" TYPE bigint;

UPDATE "planet" T SET "user_count" = (SELECT COUNT(*) FROM "planet_user" WHERE "planet_id" = T."id") WHERE 1=1;
UPDATE "planet" T SET "post_count" = (SELECT COUNT(*) FROM "post" WHERE "planet_id" = T."id") WHERE 1=1;
UPDATE "post" T SET "comment_count" = (SELECT COUNT(*) FROM "comment" WHERE "post_id" = T."id" AND "deleted" = false AND "removed" = false) WHERE 1=1;
UPDATE "post" T SET "rocket_count" = (SELECT COUNT(*) FROM "post_rocket" WHERE "post_id" = T."id") WHERE 1=1;
UPDATE "comment" T SET "rocket_count" = (SELECT COUNT(*) FROM "comment_rocket" WHERE "comment_id" = T."id") WHERE 1=1;
UPDATE "user" T SET "rocket_count" = (SELECT COUNT(*) FROM "comment_rocket" WHERE "user_id" = T."id") + (SELECT COUNT(*) FROM "post_rocket" WHERE "user_id" = T."id") WHERE 1=1;
UPDATE "user" T SET "post_count" = (SELECT COUNT(*) FROM "post" WHERE "author_id" = T."id" AND "deleted" = false AND "removed" = false) WHERE 1=1;
UPDATE "user" T SET "comment_count" = (SELECT COUNT(*) FROM "comment" WHERE "author_id" = T."id" AND "deleted" = false AND "removed" = false) WHERE 1=1;

DELETE FROM "planet_user" WHERE "planet_id" = ANY(SELECT "id" FROM "planet" WHERE "post_count" = 0);
DELETE FROM "planet_moderator" WHERE "planet_id" = ANY(SELECT "id" FROM "planet" WHERE "post_count" = 0);
DELETE FROM "planet" WHERE "post_count" = 0;
